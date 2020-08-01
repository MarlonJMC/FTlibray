window.onload=function(){
  verAutenticacion();
  generarFrasesDeLaSemana();
}

function abrirModalRegistro(){ //Mas bien es limpiar el alert del modal
  document.getElementById("alertErrorRegistro").style.display="none";
  document.getElementById("alertErrorRegistro").innerHTML="";
}


function generarFrasesDeLaSemana(){
  var contenido=""; 
  var cont=1;
  var aBordes=new Array("border-primary","border-secondary","border-success","border-danger","border-warning","border-info","border-dark");
  var aTexto=new Array("text-primary","text-secondary","text-success","text-danger","text-warning","text-info","text-dark");
  var dias=new Array("Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo");
  var colorActual=new Array("","");
  var dia="";
    firebase.firestore().collection("Frases").get().then(res=>{
      res.forEach(rpta=>{
        switch(cont){
          case 1:{
            colorActual[0]=aBordes[0]; 
            colorActual[1]=aTexto[0];
            dia=dias[0];
          }break; 
          case 2:{
            colorActual[0]=aBordes[1]; 
            colorActual[1]=aTexto[1];
            dia=dias[1];
          } break;
          case 3:{
            colorActual[0]=aBordes[2]; 
            colorActual[1]=aTexto[2];
            dia=dias[2];
          } break;
          case 4:{
            colorActual[0]=aBordes[3]; 
            colorActual[1]=aTexto[3];
            dia=dias[3];
          } break;
          case 5:{
            colorActual[0]=aBordes[4]; 
            colorActual[1]=aTexto[4];
            dia=dias[4];
          } break;
          case 6:{
            colorActual[0]=aBordes[5]; 
            colorActual[1]=aTexto[5];
            dia=dias[5];
          } break;
          case 7:{
            colorActual[0]=aBordes[6]; 
            colorActual[1]=aTexto[6];
            dia=dias[6];
          } break;
        }

        var fila= rpta.data();
        contenido+=`<div class="card ${colorActual[0]} mb-3 mt-4 ml-4 mr-4" style="max-width: 18rem;">
            <div class="card-header">${dia} ${fila.fecha}</div>
            <div class="card-body ${colorActual[1]}">
              <h5 class="card-title">${fila.autor}:</h5>
              <p class="card-text">${fila.frase}.</p>
            </div>
          </div>`;
        cont++; 
      });
      document.getElementById("divTipsSemana").innerHTML=contenido;
    }).catch(err=>{alert(err)});
}

function createUser(){ //Registra un usuario mediante correo y contraseña.... 
    var displayName=document.getElementById("txtDisplayName").value;
    var email=document.getElementById("txtCorreo").value;
    var pass=document.getElementById("txtContra").value;
    var chlogin=document.getElementById("checkLogin").checked;

    if(displayName==""){
      document.getElementById("alertErrorRegistro").style.display="block";
      document.getElementById("alertErrorRegistro").innerHTML="Debe ingresar un display name";
      return;
    }

    firebase.auth().createUserWithEmailAndPassword(email,pass)
        .then(function(result){
            return result.user.updateProfile({
              displayName:displayName
            }).then(profile=>{
              var user=result.user;
              return firebase.firestore().collection("Usuarios").doc(user.uid).set({
                nombre: "",
                apellido: "",
                email: email,
                displayName: displayName,
                photoURL: user.photoURL,
                provider: result.additionalUserInfo.providerId,
                phoneNumber: user.phoneNumber==null?"":user.phoneNumber,
                descripcion: ""
              }).then(respuesta=>{
                if(!chlogin){
                  firebase.auth().signOut();          
                  alert("¡Se registró correctamente!");
                  document.getElementById("btnCancelar").click();  
                  document.location.href="index.html"    
                }else{
                  alert("¡Se registró correctamente!");
                  document.getElementById("btnCancelar").click();  
                  document.location.href="misPrestamos.html"    
                }
              }).catch(error=>{
                alert("Error al autenticar usuario.");
              });
            }).catch(err=>{
              alert(err);
            }); 
            
            //Guardando info

        }).catch(function(error){
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
              alert('The password is too weak.');
            } else {
              alert(errorMessage);
//              alert("No se pudo finalizar el proceso, ¡error!... "+ error.toString());
            }

        });
        clearModalTexts();
}

function clearModalTexts(){
  document.getElementById("txtDisplayName").innerHTML="";
  document.getElementById("txtCorreo").innerHTML="";
  document.getElementById("txtContra").innerHTML="";
  document.getElementById("checkLogin").checked=false;
}

function iniciarSesion(){
    var email=document.getElementById("txtCorreoIngresar").value;
    var pass=document.getElementById("txtContraIngresar").value;

    firebase.auth().signInWithEmailAndPassword(email,pass).then(res=>{

        document.location.href="misPrestamos.html";
        if(res.user.photoURL!=null){
            document.getElementById("imgFotoUsuario").src=res.user.photoURL;
        }else{
            document.getElementById("imgFotoUsuario").src="img/Nouser.png";
        }
    }).catch(err=>{
        document.getElementById("alertErrorLogueo").style.display="block";
        document.getElementById("alertErrorLogueo").innerHTML=err;
    });   
}

function authGoogle(){
  const providerGoogle= new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(providerGoogle).then(res=>{
    var user=res.user;
    return firebase.firestore().collection("Usuarios").doc(user.uid).get().then(el=>{
      var inf=el.data();
      if(inf==null || inf==undefined){
        // Primera vez que ingresa o se autentica-> insertarlo en la BD
        return firebase.firestore().collection("Usuarios").doc(user.uid).set({
          nombre: res.additionalUserInfo.profile.given_name,
          apellido: res.additionalUserInfo.profile.family_name,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: res.additionalUserInfo.providerId,
          phoneNumber: user.phoneNumber==null ? "": user.phoneNumber,
          descripcion: ""
        }).then(respuesta=>{
          document.location.href="misPrestamos.html"    
        }).catch(error=>{
          alert("Error al autenticar usuario.");
        });
      }else{ // Ya existe
        document.location.href="misPrestamos.html"    
      }
    });

  }).catch(err=>{
    alert(err);
  });
}

function authFacebook(){
  const providerFacebook= new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithPopup(providerFacebook).then(res=>{
    var user=res.user;
    return firebase.firestore().collection("Usuarios").doc(user.uid).get().then(el=>{
      var inf=el.data();
      var userName=res.additionalUserInfo.profile.username;
      if(inf==null || inf==undefined){
          //No existe, se registra
          return firebase.firestore().collection("Usuarios").doc(user.uid).set({
            nombre: "",
            apellido: "",
            email: user.email==null?"":user.email,
            displayName: userName==undefined? "": userName,
            photoURL: user.photoURL,
            provider: res.additionalUserInfo.providerId,
            phoneNumber: user.phoneNumber==null?"":user.phoneNumber,
            descripcion: ""
          }).then(respuesta=>{
            document.location.href="misPrestamos.html"    
          }).catch(error=>{
            alert("Error al autenticar usuario.");
          });
      } else{ //Si existe, ingresa
        document.location.href="misPrestamos.html"
      }     
    });    

    //document.location.href="misPrestamos.html"    
  }).catch(err=>{
    alert(err);
  });    
}

function authTwitter(){
  const providerTwitt= new firebase.auth.TwitterAuthProvider();
  firebase.auth().signInWithPopup(providerTwitt).then(res=>{
    var user=res.user;
    return firebase.firestore().collection("Usuarios").doc(user.uid).get().then(el=>{
      var inf=el.data();
      if(inf==null || inf==undefined){
        // Primera vez que ingresa o se autentica-> insertarlo en la BD
        var email=res.additionalUserInfo.profile.email;
        return firebase.firestore().collection("Usuarios").doc(user.uid).set({
          nombre: "",
          apellido: "",
          email: email==null?"":email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: res.additionalUserInfo.providerId,
          phoneNumber: user.phoneNumber==null?"":user.phoneNumber,
          descripcion: res.additionalUserInfo.profile.description
        }).then(respuesta=>{
          document.location.href="misPrestamos.html"    
        }).catch(error=>{
          alert("Error al autenticar usuario.");
        });
      }else{ // Ya existe
        document.location.href="misPrestamos.html"    
      }
    });

  }).catch(err=>{
    alert(err);
  });  
}

function authGithub(){
  const providerGithub= new firebase.auth.GithubAuthProvider();
  firebase.auth().signInWithPopup(providerGithub).then(res=>{
    var user=res.user;
    return firebase.firestore().collection("Usuarios").doc(user.uid).get().then(el=>{
      var inf=el.data();
      if(inf==null || inf==undefined){
        // Primera vez que ingresa o se autentica-> insertarlo en la BD

        return firebase.firestore().collection("Usuarios").doc(user.uid).set({
          nombre: "",
          apellido: "",
          email: user.email,
          displayName: res.additionalUserInfo.username,
          photoURL: user.photoURL,
          provider: res.additionalUserInfo.providerId,
          phoneNumber: user.phoneNumber,
          descripcion: ""
        }).then(respuesta=>{
          document.location.href="misPrestamos.html"    
        }).catch(error=>{
          alert("Error al autenticar usuario.");
        });
      }else{ // Ya existe
        document.location.href="misPrestamos.html"    
      }
    });
  }).catch(err=>{
    alert(err);
  });
}