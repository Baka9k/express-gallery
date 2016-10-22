var viewer = {
	currentImage: "",
	currentImageJQ: "",
	prevImage: function() {
		var next = $(this.currentImageJQ).parent().parent().prev().find("img");
		if (next.length < 1) return;
		this.currentImageJQ = next;
		this.currentImage = $(this.currentImageJQ).attr("src").replace(/thumbnails\//, "/uploads/");
		this.update();
	},
	nextImage: function() {
		var next = $(this.currentImageJQ).parent().parent().next().find("img");
		if (next.length < 1) return;
		this.currentImageJQ = next;
		this.currentImage = $(this.currentImageJQ).attr("src").replace(/thumbnails\//, "/uploads/");
		this.update();
	},
	update: function() {
		renderImageInModal(this.currentImage);
	},
};

var initialImagesNumber = 0;
var lastPage = false;



$(document).ready(function() {
	
	initialImagesNumber = $(".square-thumbnail").length;
	
	//Add listener on #addImageModalTrigger button which opens form in modal for adding new image
 	$("#addImageModalTrigger").on('click', function (e) {
		openModal("addImageModal");
	});
	
	//Add listeners on thumbnails for opening images in modal
	$("#all-images").on("click", ".square-thumbnail", function (e) {
		var thumbLink = $(this).find("img").attr("src");
		var link = thumbLink.replace(/thumbnails\//, "/uploads/");
		openModal("imageViewerModal");
		renderImageInModal(link);
		viewer.currentImage = link;
		viewer.currentImageJQ = $(this).find("img");
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
	});
	$("#rightArrow").on('click', function (e) {
		viewer.nextImage();
	});
	
	document.addEventListener("keydown", function(event) {
		if (event.keyCode == 37) {
			viewer.prevImage();
		} else if (event.keyCode == 39) {
			viewer.nextImage();
		}
	});
	
	
	//Pagination
	
	$("#paginationLeftArrow").on('click', function (e) {
		if ($("#paginationFirstButton").text() == "0") return;
		$("#paginationFirstButton").text(parseInt($("#paginationSecondButton").text()) - 2);
		$("#paginationThirdButton").text($("#paginationSecondButton").text());
		$("#paginationSecondButton").text(parseInt($("#paginationSecondButton").text()) - 1);
		paginate();
	});
	$("#paginationRightArrow").on('click', function (e) {
		if (lastPage) return;
		$("#paginationFirstButton").text($("#paginationSecondButton").text());
		$("#paginationThirdButton").text(parseInt($("#paginationSecondButton").text()) + 2);
		$("#paginationSecondButton").text(parseInt($("#paginationSecondButton").text()) + 1);
		paginate();
	});
	$("#paginationFirstButton").on('click', function (e) {
		if ($("#paginationFirstButton").text() == "0") return;
		$("#paginationSecondButton").text($("#paginationFirstButton").text());
		$("#paginationFirstButton").text(parseInt($("#paginationSecondButton").text()) - 1);
		$("#paginationThirdButton").text(parseInt($("#paginationSecondButton").text()) + 1);
		paginate();
	});
	$("#paginationThirdButton").on('click', function (e) {
		$("#paginationSecondButton").text($("#paginationThirdButton").text());
		$("#paginationFirstButton").text(parseInt($("#paginationSecondButton").text()) - 1);
		$("#paginationThirdButton").text(parseInt($("#paginationSecondButton").text()) + 1);
		paginate();
	});
	
	checkZero();
	checkLastPage();
		
});




$(window).load(function() {
	
	addPortraitClass();
	
});




function openModal(id) {
    $("#"+id).modal();
}

function renderImageInModal(imagePath) {
	$("#imageViewerModal")
		.find("img").attr("src", "images/loading_icon.gif")
		.attr("src", imagePath)
		.css("max-height", $(window).height() - 120)
		.parent().css("min-height", $(window).height() - 120);
}

function getPage() {
	$.ajax({
		type: "POST",
		url: "/ajax/getpage",
		data: "page=" + parseInt($("#paginationSecondButton").text()),
		success: function(data)
		{
			var parsed = jQuery.parseJSON(data);
			var paths = parsed.paths;
			var last = parsed.last;
			if (last) {
				lastPage = true;
			} else {
				lastPage = false;
			}
			if (paths < 1) return;
			updateThumbnails(paths);
			console.log(last);
		},
	});
}

function checkZero() {
	if ($("#paginationSecondButton").text() == "1") {
		$("#paginationFirstButton").css("display", "none");
	} else {
		$("#paginationFirstButton").css("display", "inline");
	}
}

function checkLastPage() {
	if (lastPage) {
		$("#paginationThirdButton").css("display", "none");	
	} else {
		$("#paginationThirdButton").css("display", "inline");
	}
}

function paginate() {
	getPage();
	checkZero();
}


function updateThumbnails(paths) {
	
	var nThumbnails = $("#all-images").find("img").length;
	
	//Add or remove thumbnails containers if new page contains more/less images
	if (nThumbnails > paths.length) {
		var extra = nThumbnails - paths.length;
		$("#all-images").find(".thumb").slice(0, extra).remove();
	} else if (nThumbnails < paths.length) {
		var needed = paths.length - nThumbnails;
		$("#all-images").find(".row").append(new Array(needed + 1).join('<div class="col-xs-4 col-sm-3 col-md-2 col-lg-2 thumb"><div class="square-thumbnail"><img class="img"></div></div>'));
	}
	
	$("#all-images").find("img").each(function(index) {
		$(this).attr("src", "images/loading_icon.gif");
		$(this).attr("src", "uploads/" + paths[index]);
		$(this).load(function() {
			addPortraitClass();
		});	
	});
	
	checkLastPage();
	
}


function addPortraitClass() {

	//Add "portrait" class to vertical images thumbnails
	
	$(".thumb img").removeClass("portrait");
	
	$(".thumb").each(function(index) {
		var img = $(this).find("img");
		if ( $(img).width() < $(img).height() ) {
			$(img).addClass("portrait");
		} 
	});
	
}






