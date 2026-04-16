/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(["N/record", "N/search", 'N/runtime'],
 function (record, search, runtime) {
 
     function beforeSubmit(context) {

        try 
        {
             var executionType = context.type;
             var executionContext = runtime.executionContext;
 
             var newRecord = context.newRecord;
             var recordId = newRecord.id;
             var recordType = newRecord.type;
 
            //  var lineCount = newRecord.getLineCount({ sublistId: "lineitems" });
            //  log.debug('BS lineCount = ', lineCount);
 
            //  for (var ii = 0; ii < lineCount; ii++) {

            //     var lineId = newRecord.getSublistValue({
            //          sublistId: 'lineitems',
            //          fieldId: 'itemid',
            //          line: ii
            //      });
            //      log.debug('lineId = ', lineId + ' | ' + 'orderId = ' + lineId);
            //  }

            //  newRecord.setValue({
            //     fieldId: 'custbody_noteswave',
            //     value: 'Test Wave Notes 001',
            //     ignoreFieldChange: true
            // });
            // log.debug('SO NOTES set on waveData', 'Done');


            // Adding New lines of code to get the customer instruction on update on Wave record Customer Instruction Wave field
            var waveType = newRecord.getText("wavetype");
            log.debug('BS waveType', waveType);
 
            var pickingType = newRecord.getValue('picktype');
            log.debug('BS pickingType', pickingType);
 


            //if(waveType === 'Sales Order' && pickingType === 'SINGLE') 
            //{

                var lineCount = newRecord.getLineCount({ sublistId: "item" });
                if(lineCount) 
                {
                    var custID = newRecord.getSublistValue({
                        sublistId: 'waveorders',
                        fieldId: 'customerid',
                        line: 0
                    });
                    //log.debug('BS custID', custID);

                    var searchCustNote = search.lookupFields({
                        type: search.Type.CUSTOMER,
                        id: custID,
                        columns: ['custentity_customer_instruction_wave']
                    });
                    //log.debug("searchCustNote", searchCustNote);

                    var customerInstruction = searchCustNote.custentity_customer_instruction_wave;
                    //log.debug("BS customerInstruction", customerInstruction);

                    if(customerInstruction) 
                    {
                        newRecord.setValue({
                            fieldId: 'custbody_customer_instruction',
                            value: customerInstruction,
                            ignoreFieldChange: true
                        });
                        log.debug('Customer instruction set on waveData', customerInstruction);
                        return;
                    } 
                    else {
                        log.debug('No customer instruction found for this customer.');
                    }

                }
            //}


        } 
        catch (error) {
             log.error('Error in beforeSubmit', error.toString());
        }
    }
 
     function afterSubmit(context) {
         
        try 
        {
             var executionType = context.type;
             var executionContext = runtime.executionContext;
 
             var newRecord = context.newRecord;
             var recordId = newRecord.id;
             var recordType = newRecord.type;
 
             var waveData = record.load({
                 type: recordType,
                 id: recordId,
                 isDynamic: true
             });
 
             var waveType = waveData.getText("wavetype");
             log.debug('AS waveType', waveType);
 
             var pickingType = waveData.getValue('picktype');
             log.debug('AS pickingType', pickingType);
 


            if(waveType === 'Sales Order' && pickingType === 'SINGLE') 
            {
                 
                var lineCount = waveData.getLineCount({ sublistId: "item" });
 
                 if (lineCount) {
                     var custID = waveData.getSublistValue({
                         sublistId: 'waveorders',
                         fieldId: 'customerid',
                         line: 0
                     });
                     log.debug('AS custID', custID);

                     var orderID = waveData.getSublistValue({
                        sublistId: 'waveorders',
                        fieldId: 'ordernumberid',
                        line: 0
                     });
                     log.debug('orderID', orderID);

                     var soNotes =  search.lookupFields({
                        type: search.Type.SALES_ORDER,
                        id: orderID,
                        columns: ['custbody_notes']
                    });
                    log.debug("soNotes", soNotes);
 
                     var searchCustNote = search.lookupFields({
                         type: search.Type.CUSTOMER,
                         id: custID,
                         columns: ['custentity_customer_instruction_wave']
                     });
                     log.debug("searchCustNote", searchCustNote);
 
                     var customerInstruction = searchCustNote.custentity_customer_instruction_wave;
                    
                     if (customerInstruction) {
                         waveData.setValue({
                             fieldId: 'custbody_customer_instruction',
                             value: customerInstruction,
                             ignoreFieldChange: true
                         });
                         log.debug('Customer instruction set on waveData', customerInstruction);
                     } 
                     else {
                         log.debug('No customer instruction found for this customer.');
                     }

                     if(soNotes.custbody_notes){

                        waveData.setValue({
                            fieldId: 'custbody_noteswave',
                            value: soNotes.custbody_notes,
                            ignoreFieldChange: true
                        });
                        log.debug('SO NOTES set on waveData', soNotes.custbody_notes);

                    }
 
                     var newID = waveData.save();
                     log.debug('newID', newID);
                 }
             }
         } catch (error) {
             log.error('Error in afterSubmit', error.toString());
         }
     }
 
     return {
        //afterSubmit: afterSubmit,
        beforeSubmit: beforeSubmit
     };
 });