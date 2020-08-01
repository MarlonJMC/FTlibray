window.onload=function(){
  verAutenticacion();
}

// App's Firebase configuration
 var firebaseConfig = {
    apiKey: "YouApi",
    authDomain: "YouDomain",
    databaseURL: "https://youDatabaseURL.com",
    projectId: "YourProyect",
    storageBucket: "youSB",
    messagingSenderId: "MSID",
    appId: "YourAPI-ID",
    measurementId: "YOUR M-ID"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();


  function Salir(){
    if(confirm("¿Desea salir de la sesión actual?")==1){
      firebase.auth().signOut().then(res=>{
        document.location.href="index.html";
      }).catch(err=>{
        alert(err);
        document.location.href="index.html";
      }); 
    }
  }

  function limpiarDatos(){ //Funcion generica para limpiar controles
    var controles=document.getElementsByClassName("limpiar");
    var nControles=controles.length;
    for( i=0; i<nControles;i++){
      controles[i].value="";
    }
  }




function verAutenticacion(){
    firebase.auth().onAuthStateChanged(res=>{
      if(res==null){
        document.getElementById("itemTipoLibro").style.display="none";
        document.getElementById("itemLibro").style.display="none";
        document.getElementById("itemMisPrestamos").style.display="none";
        document.getElementById("itemRegistro").style.display="inline-block";
        document.getElementById("itemPrestamos").style.display="none";
        if(document.getElementById("divRedes")) // se ejecutrá la linea de abajo, solo si existe el divRedes
        document.getElementById("divRedes").style.visibility="visible";

        document.getElementById("divDatosUsu").style.visibility="hidden";

      }else{ //Si YA está logueado

        document.getElementById("itemTipoLibro").style.display="inline-block";
        document.getElementById("itemLibro").style.display="inline-block";
        document.getElementById("itemMisPrestamos").style.display="inline-block";
        document.getElementById("itemPrestamos").style.display="inline-block";
        document.getElementById("itemRegistro").style.display="none";

        if(document.getElementById("divRedes")) // se ejecutrá la linea de abajo, solo si existe el divRedes
        document.getElementById("divRedes").remove();

        document.getElementById("divDatosUsu").style.visibility="visible";

        if(document.getElementById("divFormLogin"))
        document.getElementById("divFormLogin").remove();

        //Obtenemos de la BD la informacion del usuario para mostrarla en la sesión, desligandose de el proveedor, del cual ya se obtuvieron los datos en el registro.
        firebase.firestore().collection("Usuarios").doc(res.uid).get().then(resultado=>{
          var resp=resultado.data();
          console.log(resp);
          if(resp.displayName!=null){
            document.getElementById("lblNombreUsuario").innerHTML=resp.displayName;
          }else{
            document.getElementById("lblNombreUsuario").innerHTML=resp.email;
          }

          if(resp.photoURL!=null){
            document.getElementById("imgFotoUsuario").src=resp.photoURL;
          }else{
            document.getElementById("imgFotoUsuario").src="img/Nouser.png";
          }

        });        

      }
    });

  }

  //USADO EN LIBROS Y PRESTAMOS, PARA LAS DESCARGAS...

  function descargarLibro(){
    if(url!=null && url!=undefined && url!="" && url!="undefined"){
        var a=document.createElement("a");
        a.href=urlDescargaPDF;
        a.target="_blank";
        a.click();
    }else{
        alert("No se encontró el archivo de este libro.");
    }
}

function descargarLibro(url){
    if(url!=null && url!=undefined && url!="" && url!="undefined"){
        var a=document.createElement("a");
        a.href=url;
        a.target="_blank";
        a.click();
    }else{
        alert("No se encontró el archivo de este libro.");
    }
}

function mostrarLoading(){

  var loading=`<div id="divLoading" style=" position: absolute; top: 50%; width: 100%;" class="align-middle d-flex justify-content-center">
  <div style="width: 6rem; height: 6rem;" class="spinner-border text-primary" role="status">
    <span class="sr-only">Loading...</span>
  </div>
  </div>`  
//margin: 0; margin-top: 100px;
  document.body.innerHTML+=loading;
}

function ocultarLoading(){
    document.getElementById("divLoading").remove();
}

function enviarMiPerfil(){
  document.location.href="miPerfil.html";
}

function FiltrarTablaPor(idInput, idTabla, columna){
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById(idInput);
  filter = input.value.toUpperCase();
  table = document.getElementById(idTabla);
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[columna];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }

}

function CambiarFiltro(valorCombo, idButton, idInput,idTabla, tipoFiltroPorDefecto,arrayFiltros){ //Funcion diseñada para el tipo de group form 
  var tipoFiltro="";  
  var columna=0; 
  //Valor combo puede ser un objeto o el objeto (button u otro, donde se ha insertado el valor)    
  if(typeof(valorCombo)==='string'){
    tipoFiltro=valorCombo;
  }else{
    tipoFiltro=valorCombo.textContent; 
    if(tipoFiltro=="Seleccione un filtro"){
      tipoFiltro=tipoFiltroPorDefecto; 
    }    
  }
  
  columna= arrayFiltros.indexOf(tipoFiltro);

  document.getElementById(idButton).textContent=tipoFiltro;
  FiltrarTablaPor(idInput,idTabla,columna);
/*  FiltrarTablaPor(idInput,idTabla,columna);*/
}

