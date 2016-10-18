$(window).load(function() {
	
	//Add "portrait" class to vertical images thubnails
	$(".thumb").each(function(index) {
		var img = $(this).find("img");
		if ( $(img).width() < $(img).height() ) {
			$(img).addClass("portrait");
		} 
	});
	
});


$(document).ready(function() {

	//Add listener on #addImageModalTrigger button which opens form in modal for adding new image
 	$("#addImageModalTrigger").on('click', function (e) {
		openModal("addImageModal");
	});
	
	//Add listeners on thumbnails for opening images in modal
	$(".square-thumbnail").each(function (index, value){
		var link = $(this).find("img").attr("src");
		$(this).on('click', function (e) {
			openModal("imageViewerModal");
			renderImageInModal(link.replace(/thumbnails\//, ""));
		});
	});
	
	$("#openInNewTabButton").on('click', function (e) {
		var imageLink = $("#imageViewer").attr("src");
		var win = window.open(imageLink, '_blank');
		if (win) {
			win.focus();
		} else {
			alert('Please allow popups for this website');
		}
	});
		
});




function openModal(id) {
    $("#"+id).modal();
}

function renderImageInModal(imagePath) {
	var fullImagePath = "uploads/" + imagePath;
	$("#imageViewerModal")
		.find("img").attr("src", fullImagePath)
		.css("max-height", $(window).height() - 120)
		.parent().css("min-height", $(window).height() - 120);
}






