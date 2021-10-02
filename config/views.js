module.exports.views = {
  templates_json: {
    map:
      " function(doc) { if (doc.template) { type='image'; if (doc.template.TemplateContainer.Template[0].templateType) type=doc.template.TemplateContainer.Template[0].templateType.toLowerCase(); emit([type, doc.template.TemplateContainer.Template[0].codeValue, doc.template], 1); emit([doc.template.TemplateContainer.Template[0].codeValue, '', doc.template], 1)}} ",
    reduce: '_count',
  },

  templates_summary: {
    map:
      " function(doc){if(doc.template){key={};key.containerUID=doc.template.TemplateContainer.uid;key.containerName=doc.template.TemplateContainer.name;key.containerDescription=doc.template.TemplateContainer.description;key.containerVersion=doc.template.TemplateContainer.version;key.containerAuthors=doc.template.TemplateContainer.authors;key.containerCreationDate=doc.template.TemplateContainer.creationDate;template={'type':'image'};if(doc.template.TemplateContainer.Template[0].templateType)template.type=doc.template.TemplateContainer.Template[0].templateType.toLowerCase();template.templateName=doc.template.TemplateContainer.Template[0].name;template.templateDescription=doc.template.TemplateContainer.Template[0].description;template.templateUID=doc.template.TemplateContainer.uid;template.templateCodeValue=doc.template.TemplateContainer.Template[0].codeValue;template.templateCodeMeaning=doc.template.TemplateContainer.Template[0].codeMeaning;template.templateVersion=doc.template.TemplateContainer.Template[0].version;template.templateAuthors=doc.template.TemplateContainer.Template[0].authors;template.templateCreationDate=doc.template.TemplateContainer.Template[0].creationDate;key.Template=[template];emit([key.Template[0].type,key.Template[0].templateUID,key],1); emit([key.Template[0].templateCodeValue,'',key],1)}} ",
    reduce: '_count',
  },

  files: {
    map:
      ' function(doc) { if (doc.fileInfo) { emit([doc.fileInfo.subject_uid,doc.fileInfo.study_uid,doc.fileInfo.series_uid, doc._id, doc.fileInfo], 1)}} ',
    reduce: '_count',
  },
};
module.exports.searchIndexes = {
  aimSearch: {
    index:
      'function(doc) { if (doc.aim) { if (doc.aim.ImageAnnotationCollection) { index("default", doc._id); if (doc.projects) { for (project of doc.projects) { index("project", project, { store: true, }); } } if ( doc.aim.ImageAnnotationCollection.person.name && doc.aim.ImageAnnotationCollection.person.name.value ) { index( "patient_name", doc.aim.ImageAnnotationCollection.person.name.value, { store: true, } ); index( "default", doc.aim.ImageAnnotationCollection.person.name.value, { store: true, } ); } if ( doc.aim.ImageAnnotationCollection.person.id && doc.aim.ImageAnnotationCollection.person.id.value ) { index("patient_id", doc.aim.ImageAnnotationCollection.person.id.value, { store: true, }); } if ( doc.aim.ImageAnnotationCollection.user.loginName && doc.aim.ImageAnnotationCollection.user.loginName.value ) { index("user", doc.aim.ImageAnnotationCollection.user.loginName.value, { store: true, }); } if ( doc.aim.ImageAnnotationCollection.dateTime && doc.aim.ImageAnnotationCollection.dateTime.value ) { const cdate = doc.aim.ImageAnnotationCollection.dateTime.value.replace( /(T|Z|-|:)/g, "" ); if (cdate.length === 14) { index("creation_date", cdate.substring(0, 8), { store: true }); index("creation_time", cdate.substring(8), { store: true }); } else { index("unknown_creation_date", cdate, { store: true }); } } if ( doc.aim.ImageAnnotationCollection.imageAnnotations && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0] ) { } if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value ) { index( "name", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split( "~" )[0], { store: true } ); index( "default", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split( "~" )[0], { store: true } ); } if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value ) { if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.includes( "~~" ) ) index( "comment", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.split( "~~" )[1], { store: true } ); index( "programmed_comment", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.split( "~~" )[0], { store: true } ); } if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0] ) { if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0]["iso:displayName"] && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0]["iso:displayName"].value ) index( "template_name", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0]["iso:displayName"].value, { store: true } ); if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0].code ) index( "template_code", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0].code, { store: true } ); index( "default", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].typeCode[0].code, { store: true } ); } if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingPhysicalEntityCollection && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingPhysicalEntityCollection.ImagingPhysicalEntity ) { for (pe of doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingPhysicalEntityCollection.ImagingPhysicalEntity) { if (pe.typeCode && pe.typeCode[0]) { index("anatomy", pe.typeCode[0]["iso:displayName"].value, { store: true, }); index("default", pe.typeCode[0]["iso:displayName"].value, { store: true, }); } if ( pe.imagingPhysicalEntityCharacteristicCollection && pe.imagingPhysicalEntityCharacteristicCollection.ImagingPhysicalEntityCharacteristic ) { for (ipc of pe.imagingPhysicalEntityCharacteristicCollection.ImagingPhysicalEntityCharacteristic) { if ( ipc.typeCode && ipc.typeCode[0] && ipc.typeCode[0]["iso:displayName"] && ipc.typeCode[0]["iso:displayName"].value ) { index("anatomy", ipc.typeCode[0]["iso:displayName"].value, { store: true, }); index("default", ipc.typeCode[0]["iso:displayName"].value, { store: true, }); } } } } } if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingObservationEntityCollection && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingObservationEntityCollection.ImagingObservationEntity ) { for (ioe of doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imagingObservationEntityCollection.ImagingObservationEntity) { if ( ioe.typeCode && ioe.typeCode[0] && ioe.typeCode[0]["iso:displayName"] && ioe.typeCode[0]["iso:displayName"].value ) { index("observation", ioe.typeCode[0]["iso:displayName"].value, { store: true, }); index("default", ioe.typeCode[0]["iso:displayName"].value, { store: true, }); } if ( ioe.imagingObservationCharacteristicCollection && ioe.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic ) { for (ioc of ioe.imagingObservationCharacteristicCollection.ImagingObservationCharacteristic) { if ( ioc.typeCode && ioc.typeCode[0] && ioc.typeCode[0]["iso:displayName"] && ioc.typeCode[0]["iso:displayName"].value ) { index("observation", ioc.typeCode[0]["iso:displayName"].value, { store: true, }); index("default", ioc.typeCode[0]["iso:displayName"].value, { store: true, }); } } } if ( ioe.imagingPhysicalEntityCharacteristicCollection && ioe.imagingPhysicalEntityCharacteristicCollection.ImagingPhysicalEntityCharacteristic ) { for (ipc of ioe.imagingPhysicalEntityCharacteristicCollection.ImagingPhysicalEntityCharacteristic) { if ( ipc.typeCode && ipc.typeCode[0] && ipc.typeCode[0]["iso:displayName"] && ipc.typeCode[0]["iso:displayName"].value ) { index("anatomy", ipc.typeCode[0]["iso:displayName"].value, { store: true, }); index("default", ipc.typeCode[0]["iso:displayName"].value, { store: true, }); } } } } } if ( doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection && doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity ) { for (ire of doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].imageReferenceEntityCollection.ImageReferenceEntity) { if (ire.imageStudy) { if (ire.imageStudy.startDate && ire.imageStudy.startDate.value) index("study_date", ire.imageStudy.startDate.value, { store: true, }); if (ire.imageStudy.instanceUid && ire.imageStudy.instanceUid.root) index("study_uid", ire.imageStudy.instanceUid.root, { store: true, }); if (ire.imageStudy.imageSeries) { if ( ire.imageStudy.imageSeries.modality && ire.imageStudy.imageSeries.modality.code ) { index("modality", ire.imageStudy.imageSeries.modality.code, { store: true, }); index("default", ire.imageStudy.imageSeries.modality.code, { store: true, }); if (ire.imageStudy.imageSeries.modality.code === "99EPADM0") { index("modality", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.split("~~")[0].split("/")[0].trim()); index("default", doc.aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].comment.value.split("~~")[0].split("/")[0].trim());}} if ( ire.imageStudy.imageSeries.instanceUid && ire.imageStudy.imageSeries.instanceUid.root ) index( "series_uid", ire.imageStudy.imageSeries.instanceUid.root, { store: true, } ); if ( ire.imageStudy.imageSeries.instanceUid && ire.imageStudy.imageSeries.instanceUid.root==="") index( "series_uid", "noseries", { store: true, } ); if ( ire.imageStudy.imageSeries.imageCollection && ire.imageStudy.imageSeries.imageCollection.Image && ire.imageStudy.imageSeries.imageCollection.Image[0] && ire.imageStudy.imageSeries.imageCollection.Image[0].sopInstanceUid && ire.imageStudy.imageSeries.imageCollection.Image[0].sopInstanceUid.root ) index( "instance_uid", ire.imageStudy.imageSeries.imageCollection.Image[0].sopInstanceUid.root, { store: true, } );if ( ire.imageStudy.imageSeries.imageCollection && ire.imageStudy.imageSeries.imageCollection.Image && ire.imageStudy.imageSeries.imageCollection.Image[0] && ire.imageStudy.imageSeries.imageCollection.Image[0].sopInstanceUid && ire.imageStudy.imageSeries.imageCollection.Image[0].sopInstanceUid.root === "") index( "instance_uid", "noinstance", { store: true, } ); } } } } } } } ',

    analyzer: 'classic',
  },
};
