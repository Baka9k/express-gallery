function openModal(id) {
    $("#"+id).modal();
}

$("#addImageModalTrigger").on('click', function (e) {
    openModal("addImageModal");
});

