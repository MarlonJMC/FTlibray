window.onload=function(){
    verAutenticacion();
    firebase.firestore().collection("TipoLibro").where("bhabilitado","==","1").orderBy("nombre","asc")
    .onSnapshot(res=>{
        listarTipoLibros(res)
    });

}

function listarTipoLibros(res){

    var contenido= "<table id='tableTipoLibro' class='table table-responsive-xl mt-2 m-auto'>"
    
    contenido+="<thead class='thead'>";
    contenido+="<tr>";
    contenido+="<th>Id</th>";
    contenido+="<th>Nombre tipo de libro</th>";
    contenido+="<th>Descripción</th>";
    contenido+="<th>Operaciones</th>";
    contenido+="</tr>";
    contenido+="</thead>";
    
    contenido+="<tbody>";

    res.forEach(rpta => {
        var fila=rpta.data();
        contenido+="<tr>";

        contenido+="<td>"+rpta.id+"</td>";
        contenido+="<td>"+fila.nombre+"</td>";
        contenido+="<td>"+fila.descripcion+"</td>";
        contenido+="<td>";
        contenido+="<button  value='Editar' class='btn btn-primary mt-2' onclick='abrirModal(\""+rpta.id+"\")' data-toggle='modal' data-target='#exampleModal'><i class='fa fa-edit'></i></button>" 
        contenido+=" <button  value='Eliminar' class='btn btn-danger mt-2' onclick='Eliminar(\""+rpta.id+"\")'><i class='fa fa-trash'></i> </button>" 
        contenido+="</td>";
        
        contenido+="</tr>";
    });

    contenido+="</tbody>";

    contenido+="</table>";

    document.getElementById("divTipoLibro").innerHTML=contenido;

}


function abrirModal(id){
     if(id==0){
        document.getElementById("lblNuevoLibro").innerHTML="Nuevo tipo de libro"
        document.getElementById("headModal").className="modal-header text-white text-bold bg-success";
        document.getElementById("btnModalTL").className="btn btn-success";
        LimpiarModal();
     }else{
        LimpiarModal();
        document.getElementById("lblNuevoLibro").innerHTML="Editando tipo de libro";
        document.getElementById("headModal").className="modal-header text-white text-bold bg-primary";
        document.getElementById("btnModalTL").className="btn btn-primary";
        firebase.firestore().collection("TipoLibro").doc(id).get().then(res=>{
            document.getElementById("idTipoLibro").value=id;
            var data= res.data();
            document.getElementById("nombreTipoLibro").value=data.nombre;
            document.getElementById("descripcion").value=data.descripcion;
        }).catch(err=>{
            alert(err);
        }); 
    }

}

function crearTipoLibro(){
    var idTipoLibro=document.getElementById("idTipoLibro").value;
    var nombre=document.getElementById("nombreTipoLibro").value;
    var descripcion=document.getElementById("descripcion").value;
    var errorMessageContent=document.getElementById("alertErrorRegistro");

    if(nombre==""){
        errorMessageContent.style.display="block";
        errorMessageContent.innerHTML="Debe ingresar el nombre del libro";
        return;
    }

    if(descripcion==""){
        errorMessageContent.style.display="block";
        errorMessageContent.innerHTML="Debe ingresar una descripción del libro";
        return;
    }

    if(idTipoLibro==""){ //NUEVO TIPO DE LIBRO
        firebase.firestore().collection("TipoLibro").add({ // EL METODO .add genera automaticamente una clave, id hash de firestore... 
            nombre: nombre,
            bhabilitado: "1",
            descripcion: descripcion
        }).then(res=>{
            alert("Se agregó correctamente");
            document.getElementById("btnCancelar").click();
        }).catch(err=>{
            document.getElementById("alertErrorRegistro").style.display="block";
            document.getElementById("alertErrorRegistro").innerHTML=err;
        });    
    }else{ //EDICION
        firebase.firestore().collection("TipoLibro").doc(idTipoLibro).update({
            descripcion: descripcion,
            nombre: nombre
        }).then(resp=>{
            alert("Se actualizó correctamente");
            document.getElementById("btnCancelar").click();
        }).catch(err=>{
            alert(err);
        });
    }
}

function LimpiarModal(){
    document.getElementById("alertErrorRegistro").style.display="none";
    document.getElementById("alertErrorRegistro").innerHTML="";

    limpiarDatos();  //desde generic.js
}

function Eliminar(id){ // ELIMINACION LOGICA, es decir, solo cambiamos el parámetro que permite hacerlo visible y usable al usuario
    if(confirm("¿Realmente desea eliminar el elemento seleccionado?")==1){
        firebase.firestore().collection("TipoLibro").doc(id).update({
            bhabilitado:"0"
        }).then(resp=>{
            alert("Se eliminó correctamente.");
        }).catch(err=>{
            alert(err); 
        });
    }
}