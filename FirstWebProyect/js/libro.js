var urlDescargaPDF="";

window.onload=function(){
    verAutenticacion();    
    firebase.firestore().collection("Libros").where("bhabilitado","==",1).orderBy("nombre","asc") //Ya que el campo bhabilitado es number
    .onSnapshot(res=>{
        listarLibros(res)
    });
    listarTipoLibroCombo();
}

function listarTipoLibroCombo(){
    var contenido="";
    contenido+="<option value=''>--Seleccione--</option>";
    firebase.firestore().collection("TipoLibro").where("bhabilitado","==","1").orderBy("nombre","asc") //Ya que el campo bhabilitado es number
    .onSnapshot(res=>{
        res.forEach(rpta=>{
            var fila=rpta.data();
            contenido+="<option value='"+rpta.id+"' >"+fila.nombre+"</option>"
        });        
        document.getElementById("cboTipoLibro").innerHTML=contenido;
    });
}

function listarLibros(res){
    var contenido= "<table id='tablaLibro' class='table table-responsive-xl mt-2 m-auto'>"
    
    contenido+="<thead>";
    contenido+="<tr>";
    contenido+="<th>Portada libro</th>";
    contenido+="<th>Nombre</th>";
    contenido+="<th>Autor</th>";
    contenido+="<th>Fecha publicación</th>";
    contenido+="<th>N° Pag.</th>";
    contenido+="<th>Operaciones</th>";
    contenido+="</tr>";
    contenido+="</thead>";
    
    contenido+="<tbody>";

    res.forEach(rpta => {
        var fila=rpta.data();
        contenido+="<tr>";

        contenido+="<td> <img class='border border-success rounded' width='70' height='95' src="+fila.photoURL+" /> </td>";
        contenido+="<td>"+fila.nombre+"</td>";
        contenido+="<td>"+fila.author+"</td>";
        contenido+="<td>"+fila.fechaPublicacion+"</td>";
        contenido+="<td>"+fila.numeroPaginas+"</td>";
        contenido+="<td>";
        contenido+="<button class='btn btn-primary mt-2'  onclick='abrirModal(\""+rpta.id+"\")' data-toggle='modal' data-target='#exampleModal'><i class='fa fa-edit'></i></button>" 
        contenido+=" <button type='button' value='Eliminar' class='btn btn-danger mt-2' onclick='Eliminar(\""+rpta.id+"\")'> <i class='fa fa-trash'></i> </button>" 
        contenido+=" <button type='button' value='Descargar' class='btn btn-outline-secondary mt-2' onclick='descargarLibro(\""+fila.fileURL+"\")'> <i class='fa fa-download'></i> </button>" 
        contenido+="</td>";
        
        contenido+="</tr>";
    });

    contenido+="</tbody>";

    contenido+="</table>";

    document.getElementById("divLibro").innerHTML=contenido;
}

function cambiarFoto(archivo){
    var file=archivo.files[0]; 
    var reader= new FileReader(); 
    nombreArchivo=file.name;
    reader.onloadend=function(){
        //Cuando se termine de leer se hará
        document.getElementById("imgFotoLibro").src=reader.result;
    }
    reader.readAsDataURL(file); 
}

function subirArchivoPDF(archivo){
    var file=archivo.files[0]; 
    var reader= new FileReader(); 
    nombreArchivo=file.name;
    reader.onloadend=function(){
        document.getElementById("iframePreview").src=reader.result;
    }
    reader.readAsDataURL(file); 
}

function abrirModal(id){
    if(id==0){
        document.getElementById("lblNuevoLibro").innerHTML="Nuevo libro"
        document.getElementById("headModal").className="modal-header text-white text-bold bg-success";
        document.getElementById("btnModalTL").className="btn btn-success";
        document.getElementById("btnDescargar").style.display="none";
        LimpiarModal();
     }else{
        LimpiarModal();
        document.getElementById("lblNuevoLibro").innerHTML="Editando libro";
        document.getElementById("headModal").className="modal-header text-white text-bold bg-primary";
        document.getElementById("btnModalTL").className="btn btn-primary";
        firebase.firestore().collection("Libros").doc(id).get().then(res=>{
            document.getElementById("txtidLibro").value=res.id;
            var data= res.data();
            document.getElementById("txtNombreLibro").value=data.nombre;
            document.getElementById("cboTipoLibro").value=data.idTipoLibro;
            document.getElementById("txtFechaPublicacion").value=data.fechaPublicacion;
            document.getElementById("txtNumeroPaginas").value=data.numeroPaginas;
            document.getElementById("txtCantidadLibros").value=data.cantidadTotal;

            // Comprobar si existen foto y archivo PDF 
            if(data.photoURL!=null && data.photoURL!=undefined && data.photoURL!="" ){
                document.getElementById("imgFotoLibro").src=data.photoURL;
            }else{
                document.getElementById("imgFotoLibro").style.display="none";
            }

            if(data.fileURL!=null && data.fileURL!=undefined && data.fileURL!=""){
                document.getElementById("iframePreview").src=data.fileURL;
            }else{
                document.getElementById("iframePreview").style.display="none";
            }
            document.getElementById("txtAutorLibro").value=data.author;
            urlDescargaPDF=data.fileURL;

            if(urlDescargaPDF==null || urlDescargaPDF== undefined){
                document.getElementById("btnDescargar").style.display="none";
            }else{
                document.getElementById("btnDescargar").style.display="inline-block";
            }
        }).catch(err=>{
            alert(err);
        }); 
    }
}

function LimpiarModal() {
    limpiarDatos(); //Desde generic.js
    document.getElementById("imgFotoLibro").src = "";
    document.getElementById("iframePreview").src = "";
}

function GuardarLibro(){
    var idLibro=document.getElementById("txtidLibro").value;
    var idTipoLibro=document.getElementById("cboTipoLibro").value;    
    var nombreLibro=document.getElementById("txtNombreLibro").value;
    var fechaPublicacion=document.getElementById("txtFechaPublicacion").value;
    var numPaginas=document.getElementById("txtNumeroPaginas").value;
    var cantidad=document.getElementById("txtCantidadLibros").value;
    var img=document.getElementById("fileFotoLibro").files[0];
    var file=document.getElementById("fileArchivoLibro").files[0];
    var autorLibro=document.getElementById("txtAutorLibro").value;

    if(idLibro==""){ //NUEVO LIBRO... 
        firebase.firestore().collection("Libros").add({
            nombre: nombreLibro,
            fechaPublicacion: fechaPublicacion,
            numeroPaginas: numPaginas,
            cantidadTotal: cantidad,
            disponibles: cantidad*1,
            bhabilitado: 1, 
            idTipoLibro: idTipoLibro,
            author: autorLibro 
        }).then(res=>{
            var id=res.id;
            //Este if ve si es que se ha subido una imagen y un arhivo y sera necesario hacer uso del storage
            if ((img != undefined && img != null) || (file != undefined && file != null)) {
                
                //IMAGEN
                if (img != undefined && img != null) {
                    var refImg = firebase.storage().ref("libroImg/" + id + "/" + img.name);
                    var subImg = refImg.put(img);

                    subImg.on("state_changed", () => { }, (err) => { alert(err) }, () => {
                        subImg.snapshot.ref.getDownloadURL().then(url => {
                            firebase.firestore().collection("Libros").doc(id).update({
                                photoURL: url
                            }).then(respuesta => {
                                alert("Imagen almacenada correctamente...");
                                document.getElementById("btnCancelar").click();
                            }).catch(err => { alert(err) });

                        }).catch(err => {

                        });
                    });
                }

                if (file != undefined && file != null) {
                    var refFile = firebase.storage().ref("libroFilePDF/" + id + "/" + file.name);
                    var subFile = refFile.put(file);

                    subFile.on("state_changed", () => { }, (err) => { alert(err) }, () => {
                        subFile.snapshot.ref.getDownloadURL().then(url => {
                            firebase.firestore().collection("Libros").doc(id).update({
                                fileURL: url
                            }).then(respuesta => {
                                alert("Archivo almacenado correctamente...");
                                document.getElementById("btnCancelar").click();
                            }).catch(err => { alert(err) });

                        }).catch(err => {

                        });
                    });
                }


            }else{
                alert("Se registró correctamente");
                document.getElementById("btnCancelar").click();
            }

        }).catch(err=>{
            alert(err);
        });    
    }else{//EDICION DE LIBRO
        firebase.firestore().collection("Libros").doc(idLibro).update({
            nombre: nombreLibro,
            fechaPublicacion: fechaPublicacion,
            numeroPaginas: numPaginas,
            cantidadTotal: cantidad,
            disponibles: cantidad*1,
            bhabilitado: 1, 
            idTipoLibro: idTipoLibro, 
            author: autorLibro
        }).then(res=>{
            //var id=res.id;
            //Este if ve si es que se ha subido una imagen y un arhivo y sera necesario hacer uso del storage
            if ((img != undefined && img != null) || (file != undefined && file != null)) {
                
                //IMAGEN
                if (img != undefined && img != null) {
                    var refImg = firebase.storage().ref("libroImg/" + idLibro + "/" + img.name);
                    var subImg = refImg.put(img);

                    subImg.on("state_changed", () => { }, (err) => { alert(err) }, () => {
                        subImg.snapshot.ref.getDownloadURL().then(url => {
                            firebase.firestore().collection("Libros").doc(idLibro).update({
                                photoURL: url
                            }).then(respuesta => {
                                alert("Imagen editada correctamente...");
                                document.getElementById("btnCancelar").click();
                            }).catch(err => { alert(err) });
//                            alert(err);
                        }).catch(err => {
                            alert(err);
                        });
                    });
                }
                //PDF. 
                if (file != undefined && file != null) {
                    var refFile = firebase.storage().ref("libroFilePDF/" + idLibro + "/" + file.name);
                    var subFile = refFile.put(file);

                    subFile.on("state_changed", () => { }, (err) => { alert(err) }, () => {
                        subFile.snapshot.ref.getDownloadURL().then(url => {
                            firebase.firestore().collection("Libros").doc(idLibro).update({
                                fileURL: url
                            }).then(respuesta => {
                                alert("Archivo editado correctamente...");
                                document.getElementById("btnCancelar").click();
                            }).catch(err => { alert(err) });

                        }).catch(err => {
                            alert(err);
                        });
                    });
                }

            }else{
                alert("Se editó correctamente");
                document.getElementById("btnCancelar").click();
            }

        }).catch(err=>{
            alert(err);
        });   

    }

}


function Eliminar(id){
    if(confirm("¿Desea eliminar el libro seleccionado?")==1){
        firebase.firestore().collection("Libros").doc(id).update({
            bhabilitado:0
        }).then(resp=>{
            alert("Se elimnó correctamente")
        }).catch(err=>{ alert(err) });
    }
}

