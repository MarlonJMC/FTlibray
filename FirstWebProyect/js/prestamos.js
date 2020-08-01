window.onload=function(){
    verAutenticacion();

    firebase.firestore().collection("Libros").where("disponibles",">",0).where("bhabilitado","==",1).orderBy("disponibles","asc")
    .onSnapshot(res=>{
      // Al crear esta consulta dio un error "Requeria crear indices"... 
        listarLibrosPrestamos(res);
    });
  }


function  listarLibrosPrestamos(res){

  var contenido="";

  res.forEach(rpta=>{
    var fila= rpta.data();

    contenido+=`<div class="card m-5" style="width: 18rem; min-height:398 px;">
    <div style="min-height: 205 px; max-height: 250 px;">    
    <img src=${fila.photoURL} class="card-img-top" style="width: 18rem" alt="${rpta.nombre}">
    </div>
    <div class="card-body align-bottom">
      <h5 class="card-title">${fila.nombre}</h5>
      <p class="card-text">Por: ${fila.author} publicado en ${fila.fechaPublicacion}</p>
      <p class="card-text">Disponibles ${fila.disponibles} /${fila.cantidadTotal} </p>
      <div class="card-footer justify-content-center p-0 align-bottom">
      <button class='btn btn-outline-secondary mt-2' onclick='descargarLibro(\"${fila.fileURL}\")'><i class='fa fa-download'> Descargar</i></button>
      <button class='btn btn-primary mt-2 ml-2' onclick='Reservar(\"${rpta.id}\")'><i class='fa fa-bookmark'> Reservar</i></button>
      </div>
    </div>
    </div>`;

  });

  document.getElementById("divPrestamos").innerHTML=contenido; 

}

function Reservar(id){
  if(confirm("¿Desea realmente reservar ese libro?")==1){
    var userid=firebase.auth().currentUser.uid; 
    mostrarLoading();
    firebase.firestore().collection("Prestamos").where("devuelto","==",0).where("idUser","==",userid)
    .where("idLibro","==",id).get().then(resp=>{
        var cantidad=0;
  
        resp.forEach(nveces=>{
          cantidad++; 
        });
  
        if(cantidad==0){
          realizarReserva(id);
        }
        else{
          ocultarLoading();
          alert("Ya ha reservado este libro.");
        } 
    }).catch(err=>{
      alert(err);
    });
  }
}

function realizarReserva(id){
  firebase.firestore().collection("Libros").doc(id).get().then(res=>{
    var disponibles = res.data().disponibles;
    disponibles--; //Disminuimos 1 de la reserva

    //Actualizamos la BD
    return firebase.firestore().collection("Libros").doc(id).update({
      disponibles: disponibles
    }).then(resp=>{
      //Registrar el prestamo en la coleccion
      var userId= firebase.auth().currentUser.uid;
      firebase.firestore().collection("Prestamos").add({
        idUser: userId,
        idLibro: id,
        fechaReserva: new Date().toLocaleDateString(),
        devuelto: 0
      }).then(resp=>{
          ocultarLoading();
          alert("Se ha reservado correctamente.")
      }).catch(err=>{
          ocultarLoading();
          alert(err);
      })
    }).catch(err=>{ ocultarLoading(); alert(err)})

  }).catch(err=>{
    ocultarLoading();
    alert(err)
  })
}