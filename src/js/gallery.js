var viewer = {
	currentImage: "",
	currentImageJQ: "",
	prevImage: function() {
		var next = $(this.currentImageJQ).parent().parent().prev().find("img");
		if (next.length < 1) return;
		this.currentImageJQ = next;
		this.currentImage = $(this.currentImageJQ).attr("src").replace(/thumbnails\//, "/uploads/");
	},
	nextImage: function() {
		var next = $(this.currentImageJQ).parent().parent().next().find("img");
		if (next.length < 1) return;
		this.currentImageJQ = next;
		this.currentImage = $(this.currentImageJQ).attr("src").replace(/thumbnails\//, "/uploads/");
	},
	update: function() {
		renderImageInModal(this.currentImage);
	},
};


$(document).ready(function() {

	//Add listener on #addImageModalTrigger button which opens form in modal for adding new image
 	$("#addImageModalTrigger").on('click', function (e) {
		openModal("addImageModal");
	});
	
	//Add listeners on thumbnails for opening images in modal
	$(".square-thumbnail").each(function (index, value){
		var thumbLink = $(this).find("img").attr("src");
		var link = thumbLink.replace(/thumbnails\//, "/uploads/");
		$(this).on('click', function (e) {
			openModal("imageViewerModal");
			renderImageInModal(link);
			viewer.currentImage = link;
			viewer.currentImageJQ = $(this).find("img");
		});
	});
	
	$("#openInNewTabButton").on('click', function (e) {
		var imageLink = viewer.currentImage;
		var win = window.open(imageLink, '_blank');
		if (win) {
			win.focus();
		} else {
			alert('Please allow popups for this website');
		}
	});
	
	$("#leftArrow").on('click', function (e) {
		viewer.prevImage();
		viewer.update();
	});
	$("#rightArrow").on('click', function (e) {
		viewer.nextImage();
		viewer.update();
	});
		
});




$(window).load(function() {
	
	//Add "portrait" class to vertical images thumbnails
	$(".thumb").each(function(index) {
		var img = $(this).find("img");
		if ( $(img).width() < $(img).height() ) {
			$(img).addClass("portrait");
		} 
	});
	
});




function openModal(id) {
    $("#"+id).modal();
}

function renderImageInModal(imagePath) {
	$("#imageViewerModal")
		.find("img").attr("src", imagePath)
		.css("max-height", $(window).height() - 120)
		.parent().css("min-height", $(window).height() - 120);
}






