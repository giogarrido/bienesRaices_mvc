import {Dropzone} from "dropzone";

const token = document.querySelector('meta[name="csrf-token"]').content;

Dropzone.options.imagen = {
    dictDefaultMessage: "Arrastre las imágenes aquí para subirlas",
    acceptedFiles: ".jpg,.png,.jpeg",
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: "Borrar Imagen",
    dictMaxFilesExceeded: "Solo se puede subir 1 imagen",
    headers:{
        "CSRF-TOKEN": token
    },
    paramName: "imagen",
    init: function(){
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function(){

            dropzone.processQueue();

        })

        dropzone.on('queuecomplete', function(){
            if(dropzone.getActiveFiles().length == 0){
                window.location.href = '/mis-propiedades'
            }
    })
}

}
