
 define(['N/log', 'N/record', 'N/search','N/runtime','N/file'],

 (log, record, search, runtime,file) => {


     const getInputData = (inputContext) => {
        try{

            var scriptobj = runtime.getCurrentScript();
            var idregistro = scriptobj.getParameter({name: 'custscript_kvk_json_item'});

            var fileContent = file.load({
                id: idregistro
            });

            var nombre = fileContent.name

            var contenido_file = fileContent.getContents();

            var iterator = fileContent.lines.iterator();
            var fileLines = fileContent.lines;
            
            var count = 0;
            var ObjetoLineas = { };
            var tipo = '';
            iterator.each(function(line) {
                if(count==0){
                    var arrayLinea = line.value.split(',');
                    tipo = arrayLinea[0]
                }
                if(count > 4){
                    var arrayLinea = line.value.split(',');
                    var SubObjetoLineas= { 
                        MunCode: arrayLinea[0],
                        EstCode: arrayLinea[1],
                        Description: arrayLinea[2],
                        CodigoPostal: arrayLinea[3],
                        tipo:tipo
                    };
                    ObjetoLineas[count] = SubObjetoLineas;
                   
                }

                count ++;
                return true
            });
             return ObjetoLineas
         } catch (e) {
             log.error({title: 'Error GetInput', details: e});
         }

     }

var contador =0;
     const map = (mapContext) => {


         try {
            log.audit({title: 'map - mapContext', details: mapContext});
             var datos = JSON.parse(mapContext.value);           
             mapContext.write({
                 key: contador,
                 value: datos
             });
             contador++;
         } catch (e) {
             log.error({title: 'map - error', details: e});
         }

     }

     const reduce = (reduceContext) => {
         try {
             var data = JSON.parse(reduceContext.values);
             var SinEspacios = (data.tipo).replace(' ', '')
             if(SinEspacios.includes('municipios')){     
                var mainReg = record.create({
                    type: 'customrecord_kvk_cp_est_mun',
                });
   
                mainReg.setValue({
                    fieldId: "custrecord_kvk_cp_mun_code",
                    value: data.MunCode,
                });
   
                mainReg.setValue({
                    fieldId: "custrecord_kvk_cp_est_code",
                    value: data.EstCode,
                });
   
                mainReg.setValue({
                    fieldId: "custrecord_kvk_cp_descripcion_m_e",
                    value: data.Description,
                });
                 mainReg.setValue({
                    fieldId: "name",
                    value: data.Description,
                });
                var IdMainReg =   mainReg.save();
             }
             
             if(SinEspacios.includes('colonias')){
                var mainRegC = record.create({
                    type: 'customrecord_kvk_cp_col_sat',
                });
   
                mainRegC.setValue({
                    fieldId: "custrecord_kvk_cp_col_code",
                    value: data.MunCode,
                });
   
                mainRegC.setValue({
                    fieldId: "custrecord_kvk_cp_est_col_code",
                    value: data.EstCode,
                });
   
                mainRegC.setValue({
                    fieldId: "custrecord_kvk_cp_descripcion_col",
                    value: data.Description,
                });
                mainRegC.setValue({
                    fieldId: "name",
                    value: data.Description,
                });
                var IdMainRegC =   mainRegC.save();
             }
             if(SinEspacios.includes('localidades')){ 
                var mainRegL = record.create({
                    type: 'customrecord_kvk_cp_loc_sat',
                });
   
                mainRegL.setValue({
                    fieldId: "custrecord_kvk_cp_loc_code",
                    value: data.MunCode,
                });
   
                mainRegL.setValue({
                    fieldId: "custrecord_kvk_cp_est_loc",
                    value: data.EstCode,
                });
   
                mainRegL.setValue({
                    fieldId: "custrecord_kvk_des_loc_sat",
                    value: data.Description,
                });
               mainRegL.setValue({
                    fieldId: "name",
                    value: data.Description,
                });
                
                var IdMainRegL =   mainRegL.save();
             }
             if(SinEspacios.includes('estados')){
                var mainRegL = record.create({
                    type: 'customrecord_kvk_cp_estados_sat',
                });
   
                mainRegL.setValue({
                    fieldId: "custrecord_kvk_cp_est_code_sat",
                    value: data.MunCode,
                });
   
                mainRegL.setValue({
                    fieldId: "custrecord_kvk_cp_est_name",
                    value: data.Description,
                });
               
                mainRegL.setValue({
                    fieldId: "name",
                    value: data.Description,
                });

                var IdMainRegL =   mainRegL.save();
             }
             if(SinEspacios.includes('postales')){ 
                var mainRegCP = record.create({
                    type: 'customrecord_kvk_cp_cod_postal_sat',
                });
   
                mainRegCP.setValue({
                    fieldId: "custrecord_kvk_cp_codigo_postal",
                    value: data.MunCode,
                });
   
                mainRegCP.setValue({
                    fieldId: "custrecord_kvk_cp_cp_code_est",
                    value: data.EstCode,
                });

                mainRegCP.setValue({
                    fieldId: "custrecord_kvk_cp_cp_mun",
                    value: data.Description,
                });
   
                mainRegCP.setValue({
                    fieldId: "custrecord_kvk_cp_cp_localidad",
                    value: data.CodigoPostal,
                });
               
                mainRegCP.setValue({
                    fieldId: "name",
                    value: data.MunCode,
                });

                var IdMainRegCP =   mainRegCP.save();
             }
         }catch (e) {

             log.audit({title:'error', details: e})


         }

     }

     const summarize = (summaryContext) => {

     }

     return {getInputData, map, reduce, summarize}

 });