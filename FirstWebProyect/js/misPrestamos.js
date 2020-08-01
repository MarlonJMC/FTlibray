var libros=[]; 
window.onload=function(){
    verAutenticacion();

    firebase.firestore().collection("Libros").get().then(el=>{
        el.forEach(res=>{
            libros.push({idLibro: res.id, nombre: res.data().nombre});
        });
    }).catch(err=>{alert("Error al descargar los libros")});


    firebase.auth().onAuthStateChanged(el=>{
        var idUser=firebase.auth().currentUser.uid;
        firebase.firestore().collection("Prestamos").where("idUser","==",idUser).where("devuelto","==",0).orderBy("fechaReserva","desc").onSnapshot(res=>{
            listarMisPrestamos(res);
        });
    });

    firebase.auth().onAuthStateChanged(el=>{
        var idUser=firebase.auth().currentUser.uid;
        firebase.firestore().collection("Prestamos").where("idUser","==",idUser).where("devuelto","==",1).orderBy("fechaReserva","desc").onSnapshot(res=>{
            listarMiHistorial(res);
        });
    });
}

function listarMiHistorial(res){
    var contenido="<table id='tableHistorialMP' style='height: 50vh;' class='table table-responsive-lg table-bordered table-striped'>"

    contenido+="<thead>";
    contenido+="<tr>";    
    contenido+="<th>Libro</th>";
    contenido+="<th>Fecha reserva</th>";
    contenido+="</tr>";
    contenido+="</thead>";
    //Contenido de la tabla
    contenido+="<tbody>";
    res.forEach(el=>{
        var fila=el.data();

        contenido+="<tr>";
        contenido+="<td>"
        +   libros.filter(p=>p.idLibro==fila.idLibro).map(p=>p.nombre)+
        "</td>";
        contenido+="<td>"+fila.fechaReserva+"</td>";
        contenido+="</tr>";    

    });
    contenido+="</tbody>";
    contenido+="</table>";
    document.getElementById("divHistorial").innerHTML=contenido;
}

function listarMisPrestamos(res){
    var contenido="<table id='tablaMisPrestamos' class='table table-responsive-xl table-striped'>"

    contenido+="<thead>";
    contenido+="<tr>";    
    contenido+="<th>Id prestamos</th>";
    contenido+="<th>Fecha reserva</th>";
    contenido+="<th>Libro</th>";
    contenido+="<th>Operaciones</th>";
    contenido+="</tr>";
    contenido+="</thead>";
    //Contenido de la tabla
    contenido+="<tbody>";
    res.forEach(el=>{
        var fila=el.data();

        contenido+="<tr>";
        contenido+="<td>"+el.id+"</td>";
        contenido+="<td>"+fila.fechaReserva+"</td>";
        contenido+="<td>"
        +   libros.filter(p=>p.idLibro==fila.idLibro).map(p=>p.nombre)+
        "</td>";
        contenido+="<td>"+
        "<button class='btn btn-primary' onclick='Devolver(\""+el.id+"\",\""+fila.idLibro+"\")'><i class='fa fa-bookmark-o'> Devolver</i></button>"
        +"</td>";                                           //IdPrestamo y idLibro a devolver
        contenido+="</tr>";    

    });
    contenido+="</tbody>";
    contenido+="</table>";
    document.getElementById("divMisPrestamos").innerHTML=contenido;
}


function Devolver(id,idLibro){
    if(confirm("¿Realmente desea realizar la devolución?")==1){
        firebase.firestore().collection("Prestamos").doc(id).update({
            devuelto: 1
        }).then(res=>{
            //Sacamos el número de libros disponibles
            firebase.firestore().collection("Libros").doc(idLibro).get().then(resp=>{
                var disponibles=resp.data().disponibles+1;
                //Actualizar la propiedad 
                firebase.firestore().collection("Libros").doc(idLibro).update({
                    disponibles: disponibles
                }).then(res=>{
                    alert("Se realizó la devolución correctamente.");
                }).catch(err=>{alert(err)})
            }).catch(err=>{ alert(err) });                       
        }).catch(err=>{
            alert(err);
        }); 
    }
}