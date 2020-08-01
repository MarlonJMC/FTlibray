window.onload=function(){
    verAutenticacion();
    firebase.auth().onAuthStateChanged(res=>{
        CargarPerfil();
    });
}

var user; //VARIABLE GLOBAL PARA EL USO DE TODAS LAS FUNCIONES
var nombreArchivo;

function GuardarEdicionPerfil(){

    var displayName=document.getElementById("txtDisplayName").value;
    var nombre=document.getElementById("txtNombre").value;
    var apellido=document.getElementById("txtApellido").value;
    var email= document.getElementById("txtEmail").value;
    var descripcion=document.getElementById("txtDescripcion").value;
    var telefono=document.getElementById("txtTelefono").value;

    firebase.firestore().collection("Usuarios").doc(user).update({
        displayName: displayName,
        nombre: nombre,
        apellido: apellido,
        email: email,
        descripcion: descripcion,
        phoneNumber: telefono
    }).then(resul=>{
        var objFoto=document.getElementById("fileFotoPerfil"); //EL input de las fotos. 

        //Obtiene la ruta del archivo seleccionado
        var foto=objFoto.value;
        
        //Verificar que haua elegido un archivo
        if(foto!=null && foto!=""){
            var ref=firebase.storage().ref("fotoPerfil/"+user+"/"+nombreArchivo);
            var archivo=objFoto.files[0];
            var refFoto= ref.put(archivo);

            refFoto.on("state_changed",()=>{}, (err)=>{alert(err)}, ()=>{
                //Mientras, Haya un error, Termine de subirlo

                //Si se sube correctamente actualizamos el URL                   
                refFoto.snapshot.ref.getDownloadURL().then(url=>{                         
                    firebase.firestore().collection("Usuarios").doc(user).update({
                        photoURL: url
                    }).then(respuesta=>{
                        alert("Actualización realizada con éxito.");
                        verAutenticacion();
                    }).catch(err=>{
                        alert(err);
                    });

                });
            });

        }else{  //No he eligió algo como para actualizar.
  //          alert("FOTO: "+foto);
        }
    }).catch(err=>{
        alert(err);
    });

//    verAutenticacion();

}

function cambiarFoto(archivo){
    var file=archivo.files[0]; 
    var reader= new FileReader(); 
    nombreArchivo=file.name;
    reader.onloadend=function(){
        //Cuando se termine de leer se hará
        document.getElementById("imgFotoPerfil").src=reader.result;
//      alert(reader.readyState);
//        document.getElementById("imgFotoPerfil").value=reader.result.url;
    }
    reader.readAsDataURL(file); 
}

function CargarPerfil(){
    user=firebase.auth().currentUser.uid;
    firebase.firestore().collection("Usuarios").doc(user).get().then(resultado=>{
        var res= resultado.data();
        document.getElementById("txtDisplayName").value=res.displayName;
        document.getElementById("txtNombre").value=res.nombre;
        document.getElementById("txtApellido").value=res.apellido;
        document.getElementById("txtEmail").value=res.email;
        document.getElementById("txtDescripcion").value=res.descripcion;
        document.getElementById("txtTelefono").value=res.phoneNumber;
        document.getElementById("imgFotoPerfil").src=res.photoURL;

    }).catch(err=>{
        alert(err);
    });
}