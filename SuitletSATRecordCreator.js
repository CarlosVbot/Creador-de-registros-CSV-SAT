/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

 define(['N/ui/serverWidget', 'N/search', 'N/https', 'N/record', 'N/render','N/file','N/task'], function(ui, search, https, record, render,file,task) {
    function onRequest(context) {

        try {

            if (context.request.method === 'GET') {

                var form = ui.createForm({
                    title: 'Carga Codigos SAT',
                });
                //vincular Client

                //campo tipo select
                form.addSubmitButton({label: 'Procesar'});
                //llenar campo con busqueda
                var Documento = form.addField({
                    id: 'custom_efx_doc',
                    type: ui.FieldType.FILE,
                    label: 'Primer archivo',
                });
                
                context.response.writePage(form);
            }else{

                var params = context.request.parameters;
                var fileID;
                var fileType;

                //Carpeta donde se guardan los archivos, debido a una decicion 
                var IDcarpeta = params.folder;

                //revisar si hay un documento seleccionado
                 if (context.request.files['custom_efx_doc'] )
                 {
                     var archivo = context.request.files['custom_efx_doc'];
                     
                     //Busca si ya se ha subido
                     var ResBusqueda = BuscarArchivoEnCarpeta(IDcarpeta,archivo)

                     // si no existe lo guarda en el filegabinet
                     if(ResBusqueda == 0) {
                         var documento = archivo;
                         documento.name = archivo.name;
                         documento.folder = IDcarpeta;
                         var id_doc = documento.save();                     
                         var ResLeer = ProcesarDocumento(id_doc,0)
                     }else{
                         var ResLeer = ProcesarDocumento(0,ResBusqueda)
                     }

                 }

                log.debug({title: 'post', details: context.request.parameters});
                //Crear form
                var form = ui.createForm({
                    title: 'Cargado',
                });
               
                
                context.response.writePage(form);
            }

        }catch (e) {
            //Crear form
            var form = ui.createForm({
                title: 'Error',
            });
            //vincular Client

            //campo tipo select
            form.addSubmitButton({label: 'Procesar'});
            //llenar campo con busqueda
            var Documento = form.addField({
                id: 'custom_efx_doc',
                type: ui.FieldType.FILE,
                label: 'Documento',
            });

            context.response.writePage(form);
        }
    }

    function BuscarArchivoEnCarpeta(IDcarpeta,archivo) {
        try{

            var busqueda_archivo = search.create({
                type: search.Type.FOLDER,
                filters: [
                    ["internalid","anyof",IDcarpeta],
                    "AND",
                    ["file.name","is",archivo]
                ],
                columns: [
                    search.createColumn({name: 'internalid' , join: 'file' }),
                ]
            });

            var Coincidencias = busqueda_archivo.runPaged().count;
            if (Coincidencias==0)
            {
                return Coincidencias;
            }else{
                var IDres = [];
                busqueda_archivo.run().each(function(result){
                    var objRes = {
                        "idArchivo" : ""
                    }
                    objRes.idArchivo = result.getValue({name: 'internalid', join: 'file'})
                    IDres.push(objRes);
                    return true;
                });
                log.debug({title: 'IDres', details: IDres});
                return IDres;
            }



        }catch (e) {
            log.debug({title: 'Error 109', details: e});
            return false
        }
    }
    function ProcesarDocumento(id_doc,ResBusqueda) {
        try{

            if(id_doc==0 ){
                id_doc  = ResBusqueda[0].idArchivo
            }
                
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_kvk_sat_map_creator' ,
                    deploymentId: 'customdeploy_kvk_sat_map_creator',
                    params: {
                        custscript_kvk_json_item:  id_doc   
                    }
                });
           
                var mrTaskId = mrTask.submit();


        }catch (e) {
            log.debug({title: 'Error no se pudo procesar', details: e});
            return false
        }
    }
    return {
        onRequest: onRequest,
    };
});