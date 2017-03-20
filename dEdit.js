$(document).ready(function(){

	function windowOffset(elem){
		var iTop = elem.offset().top;
		var iLeft = elem.offset().left;
		var res = {
			top: iTop - $(window).scrollTop(),
			left: iLeft - $(window).scrollLeft()
		}
		return res;
	} 


	//Inserting required elements.
	var dEditHTML = '<div class="dEdit-img-edit"><canvas class="dEdit-img-edit-can"></canvas><canvas class="dEdit-img-edit-process-can"></canvas><div class="dEdit-img-edit-select"><div class="dEdit-img-edit-select-resize"></div></div><div class="dEdit-img-edit-act dEdit-img-edit-save"> Done </div><div class="dEdit-img-edit-act dEdit-img-edit-rotate"> Rotate </div><div class="dEdit-img-edit-act dEdit-img-edit-cancel"> Cancel </div></div>';
	$("body").append(dEditHTML);
	
	
	//Main Image Editor Object
	window.dEdit = {

		//Caching Selectors
		can: $('.dEdit-img-edit-can')[0],
		processCan: $('.dEdit-img-edit-process-can')[0],
		selectionBox: $('.dEdit-img-edit-select'),
		container: $('.dEdit-img-edit'),
		saveBtn: $(".dEdit-img-edit-save"),
		cancelBtn: $('.dEdit-img-edit-cancel'),
		rotateBtn: $('.dEdit-img-edit-rotate'),

		//Internal Properties
		drag: false,
		resize: false,
		square: true,
		status: false,
		grcx: null,
		grcy: null,
		callback: null,
		imageType: null,
		imageQuality: 1,
		imgObj: null,
		degree: 0,

		rotate: function(){
			this.degree+=90;
			this.degree%=360;
			var ctx = this.can.getContext("2d");
			var img=new Image();
			var that =  this;
			$(img).on("load", function(){
				var cw = img.width, ch = img.height, cx = 0, cy = 0;
				switch(that.degree){
					case 0:
						cw = img.width;
						ch = img.height;
						cx = 0;
						cy = 0;
						break;
				    case 90:
				        cw = img.height;
				        ch = img.width;
				        cy = img.height * (-1);
				        break;
				    case 180:
				        cx = img.width * (-1);
				        cy = img.height * (-1);
				        break;
				    case 270:
				        cw = img.height;
				        ch = img.width;
				        cx = img.width * (-1);
				        break;
				}
				that.can.height=ch;
				that.can.width=cw;
				if(cw > ch){
					that.can.style.width = ($(window).width()/2*1)+"px"; 
					that.can.style.height = (ch*(($(window).width()/2*1)/cw))+"px";
					dEdit.selectionBox.height($(that.can).height());
					dEdit.selectionBox.width($(that.can).height());
					dEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).height()/2) + 10  + 'px' ,'top': ($(window).height()/2 - $(that.can).height()/2 - 25) + 'px' });
				}else if(cw < ch){
					that.can.style.width = (cw*(($(window).height()/3*2)/ch)) + "px";
					that.can.style.height = ($(window).height()/3*2) + "px"; 
					dEdit.selectionBox.height($(that.can).width());
					dEdit.selectionBox.width($(that.can).width());
					dEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).width()/2)  + 'px' ,'top': $(window).height()/2 - $(that.can).width()/2 - 15 + 'px' });
				}else{
					that.can.style.width = ($(window).height()/4.8*3.3) + "px";
					that.can.style.height = ($(window).height()/4.8*3.3) + "px";					
					dEdit.selectionBox.height($(that.can).width());
					dEdit.selectionBox.width($(that.can).width());
					dEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).width()/2)  + 'px' ,'top': ($(window).height()/2 - $(that.can).height()/2 - 25) + 'px' });
				}
				ctx.fillStyle = '#fff'; 
				ctx.fillRect(0, 0, that.can.width, that.can.height);
				ctx.rotate(that.degree*Math.PI/180);
				ctx.drawImage(img, cx, cy);
			});
			img.src=URL.createObjectURL(this.imgObj);
			
		},
		//Open the Image Editor with appropriate settings
		open: function(imgObj, square, callback, imageType, imageQuality){
			this.imgObj=imgObj;
			this.drag = false,
			this.resize = false,

			this.square = square || false,
			this.imageQuality = imageQuality || 1;

			if(imageType == "jpeg" || imageType == "png" || imageType == "gif" || imageType == "bmp"){ //JPG and any other would default to JPEG//
				this.imageType = imageType || "jpeg";
			}else{
				this.imageType = "jpeg";	
			}

			//niu = Not In Use
			this.grcx = "niu",
			this.grcy = "niu",
			
			//Specifyinf user callback
			this.callback = callback,
			this.status = true;

			var ctx = this.can.getContext("2d");

			//Shwoing the conatiner on screen
			dEdit.container.css("display","block").stop().animate({"opacity":"1"});

			var img = new Image();
			var that =  this;
			//Draw the image on the visible canvas depending on the aspect ratio of the image.
			$(img).on("load", function(){
				if(img.width > img.height){
					that.can.width = img.width;
					that.can.height = img.height;

					that.can.style.width = ($(window).width()/2*1)+"px"; 
					that.can.style.height = (img.height*(($(window).width()/2*1)/img.width))+"px";
	
					
					ctx.fillStyle = '#fff'; 
					ctx.fillRect(0, 0, that.can.width, that.can.height);
					
					ctx.drawImage(img, 0,0, that.can.width, that.can.height);
					
					//ctx.translate(-that.can.width,that.can.height);

					dEdit.selectionBox.height($(that.can).height());
					dEdit.selectionBox.width($(that.can).height());

					dEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).height()/2) + 10  + 'px' ,'top': ($(window).height()/2 - $(that.can).height()/2 - 25) + 'px' });
				}else if(img.width < img.height){

					that.can.width = img.width;
					that.can.height = img.height;

					that.can.style.width = (img.width*(($(window).height()/3*2)/img.height)) + "px";
					that.can.style.height = ($(window).height()/3*2) + "px"; 

					ctx.fillStyle = '#fff'; 
					ctx.fillRect(0, 0, that.can.width, that.can.height);

					ctx.drawImage(img, 0, 0, that.can.width, that.can.height);

					dEdit.selectionBox.height($(that.can).width());
					dEdit.selectionBox.width($(that.can).width());

					dEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).width()/2)  + 'px' ,'top': $(window).height()/2 - $(that.can).width()/2 - 15 + 'px' });


				}else{

					that.can.width = img.width;
					that.can.height = img.height;

					that.can.style.width = ($(window).height()/4.8*3.3) + "px";
					that.can.style.height = ($(window).height()/4.8*3.3) + "px";					


					ctx.fillStyle = '#fff'; 
					ctx.fillRect(0, 0, that.can.width, that.can.height);

					ctx.drawImage(img, 0, 0, that.can.width, that.can.height);

					dEdit.selectionBox.height($(that.can).width());
					dEdit.selectionBox.width($(that.can).width());
				
					dEdit.selectionBox.css({'left': (($(window).width()/2) - $(that.can).width()/2)  + 'px' ,'top': ($(window).height()/2 - $(that.can).height()/2 - 25) + 'px' });
				}

			});
			
			img.src = URL.createObjectURL(imgObj);
			
		},

		//Close the image editor and reset the settings.
		close: function(){
			this.drag = false;
			this.resize = false;
			this.square = true;
			this.status = false;
			this.grcx = undefined;
			this.grcy = undefined;
			this.callback = undefined;

			this.can.height = 0;
			this.can.width = 0;

			this.processCan.height = 0;
			this.processCan.width = 0;

			var pCtx = this.processCan.getContext("2d");			
			var ctx = this.can.getContext("2d");

			ctx.clearRect(0, 0, 0, 0);
			pCtx.clearRect(0, 0, 0, 0);
		
			dEdit.selectionBox.css({
				"height":'0px',
				"width":'0px',				
			});		

			dEdit.container.stop().animate({
				"opacity":"0"
			}, 300);

			setTimeout(function(){
				dEdit.container.css({"display":"none"});
			}, 300);

		}
	}

	//Set flags to stop trachong mouse movement.
	$(document).on("mouseup",function(){
		dEdit.drag = false;
		dEdit.resize = false;	

		dEdit.grcx = 'niu';
		dEdit.grcy = 'niu';
	});


	//Set flags to start trachong mouse movement.
	dEdit.selectionBox.on("mousedown",function(e){
		var that = $(this);

		var rcx = e.clientX - windowOffset(that).left;
		var rcy = e.clientY - windowOffset(that).top;

		dEdit.grcx = 'niu';
		dEdit.grcy = 'niu';

		if( (dEdit.selectionBox.width() - rcx <= 28) && (dEdit.selectionBox.height() - rcy <= 28)){
			dEdit.drag = false;
			dEdit.resize = true;
		}else{
			dEdit.drag = true;
			dEdit.resize = false;
		}


	});


	//Track mouse movements when the flags are set.
	$(document).on('mousemove', function(e){

		var rcx = e.clientX - windowOffset(dEdit.selectionBox).left;
		var rcy = e.clientY - windowOffset(dEdit.selectionBox).top;

		if(dEdit.drag === true && dEdit.status){

			if(dEdit.grcx === 'niu'){
				dEdit.grcx = rcx;
			}

			if(dEdit.grcy === 'niu'){
				dEdit.grcy = rcy;
			}

			var xMove = e.clientX - dEdit.grcx;
			var yMove = e.clientY - dEdit.grcy;


			if( (xMove + dEdit.selectionBox.width() >= $(dEdit.can).width() + windowOffset($(dEdit.can)).left) || xMove <= windowOffset($(dEdit.can)).left){
				if(xMove <= windowOffset($(dEdit.can)).left){
					dEdit.selectionBox.css({"left":windowOffset($(dEdit.can)).left+"px"});
				}else{
					dEdit.selectionBox.css({"left":windowOffset($(dEdit.can)).left + $(dEdit.can).width() - dEdit.selectionBox.width() + "px"});						
				}
			}else{
				dEdit.selectionBox.css({"left":xMove+"px"});
			}


			if((yMove + dEdit.selectionBox.height() >= $(dEdit.can).height() + windowOffset($(dEdit.can)).top) || (yMove <= windowOffset($(dEdit.can)).top) ){
				if(yMove <= windowOffset($(dEdit.can)).top){
					dEdit.selectionBox.css({"top":windowOffset($(dEdit.can)).top+"px"});
				}else{
					dEdit.selectionBox.css({"top":windowOffset($(dEdit.can)).top + $(dEdit.can).height() - dEdit.selectionBox.height() + "px"});
				}
			}else{
				dEdit.selectionBox.css({"top":yMove+"px"});
			}

		}else if(dEdit.resize === true && dEdit.status){

			var nWidth = rcx;
			var nHeight = rcy;

			if(dEdit.square){
				if(nWidth >= nHeight){//Width is the dominating dimension; 
					nHeight = nWidth;
					if(nWidth < 100){
						nWidth = 100;
						nHeight = 100;						
					}
				}else{//Height is the dominating dimension; 
					nWidth = nHeight;
					if(nHeight < 100){
						nWidth = 100;
						nHeight = 100;
					}
				}				

				if((nWidth + windowOffset(dEdit.selectionBox).left) >= $(dEdit.can).width() + windowOffset($(dEdit.can)).left){
					nWidth = (windowOffset($(dEdit.can)).left + $(dEdit.can).width()) - (windowOffset(dEdit.selectionBox).left);
					if(windowOffset(dEdit.selectionBox).top + nWidth > $(dEdit.can).height() + windowOffset($(dEdit.can)).top){
						nWidth = (windowOffset($(dEdit.can)).top + $(dEdit.can).height()) - (windowOffset(dEdit.selectionBox).top);
					}
					nHeight = nWidth;
				}else if((nHeight + windowOffset(dEdit.selectionBox).top) >= $(dEdit.can).height() + windowOffset($(dEdit.can)).top){
					nHeight = (windowOffset($(dEdit.can)).top + $(dEdit.can).height()) - (windowOffset(dEdit.selectionBox).top);
					if(windowOffset(dEdit.selectionBox).left + nHeight > $(dEdit.can).width() + windowOffset($(dEdit.can)).left){
						nHeight = (windowOffset($(dEdit.can)).left + $(dEdit.can).width()) - (windowOffset(dEdit.selectionBox).left);
					}
					nWidth = nHeight;
				}


			}else{

				if(nWidth <= 100){
					nWidth = 100;
				}
				if(nHeight <= 100){
					nHeight = 100;
				}			
				if(e.clientX >= $(dEdit.can).width() + windowOffset($(dEdit.can)).left){    //REASON: nWidth + windowOffset(dEdit.selectionBox).left = e.clientX;
					nWidth = (windowOffset($(dEdit.can)).left + $(dEdit.can).width()) - (windowOffset(dEdit.selectionBox).left);
				}
				if(e.clientY >= $(dEdit.can).height() + windowOffset($(dEdit.can)).top){	//REASON: Same logic as nWidth
					nHeight = (windowOffset($(dEdit.can)).top + $(dEdit.can).height()) - (windowOffset(dEdit.selectionBox).top);
				}

			}


			dEdit.selectionBox.css({
				"width":nWidth+"px",
				"height":nHeight+"px",				
			});
	
		}

	});

	//Process the selected region and return it as an image to the user defined callback.
	dEdit.saveBtn.on("click", function(){

		if(dEdit.callback == undefined){
			dEdit.close();
			return;
		}

		var ratio = dEdit.can.width/$(dEdit.can).width();

		var h = dEdit.selectionBox.height() * ratio;
		var w = dEdit.selectionBox.width() * ratio;		
		var x = (windowOffset(dEdit.selectionBox).left - windowOffset($(dEdit.can)).left) * ratio;
		var y = (windowOffset(dEdit.selectionBox).top - windowOffset($(dEdit.can)).top) * ratio;		

		dEdit.processCan.height = h;
		dEdit.processCan.width = w;		
		
		var pCtx = dEdit.processCan.getContext("2d");

		pCtx.drawImage(dEdit.can, x, y, w, h, 0, 0, w, h);


		dEdit.callback(dEdit.processCan.toDataURL("image/"+dEdit.imageType, dEdit.imageQuality));
		dEdit.close();

	});

	//Close the canvas without processing the image on cancel.
	dEdit.cancelBtn.on("click", function(){
		dEdit.close();
	});

	dEdit.rotateBtn.on("click", function(){
		dEdit.rotate();
	});

	//Setup canvas when window is resized. 
	$(window).on("resize", function(){
		if(dEdit.status){
			dEdit.selectionBox.css({'left': (($(window).width()/2) - $(dEdit.can).height()/2) + 10  + 'px' ,'top': $(window).height()/2 - $(dEdit.can).height()/2 + 10 + 'px' });
		}
	});	
});