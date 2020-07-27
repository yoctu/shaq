jQuery(document).ready(function() {
    $(function () {
	$("#dppu").datepicker({
        	autoclose: true,
		todayHighlight: true,
	}).datepicker('update', new Date(Date.now() + 48 * 60 * 60 * 1000));
        $("#dpde").datepicker({
                autoclose: true,
                todayHighlight: true,
        }).datepicker('update', new Date(Date.now() + 96 * 60 * 60 * 1000));
    });

    $('.registration-form fieldset:first-child').fadeIn('slow');

    $('input, select').on('focus', function() {
	$(this).removeClass('input-error');
    });

    $('.registration-form .btn-end').on('click', function() {
        var parent_fieldset = $(this).parents('fieldset');
        var end_step = true;
        $("input").removeClass('input-error');
        $("select").removeClass('input-error');

        if (["NA",""].includes($("#form-contact-from-email").val())) {
            $("#form-contact-from-email").val($("#email").val());
        }
        if (["NA",""].includes($("#form-contact-to-email").val())) {
            $("#form-contact-to-email").val($("#email").val());
        }

        parent_fieldset.find('input').each(function() {
            if( $(this).val() == "" && $(this).prop('required')) {
                $(this).addClass('input-error');
                end_step = false;
            }
            if( this.id === 'form-from' && From.city === ''){
                $(this).addClass('input-error');
                end_step = false;
            }
            if( this.id === 'form-to' &&  To.city === ''){
                $(this).addClass('input-error');
                end_step = false;
            }
        });

        if( end_step ) {
            parent_fieldset.fadeOut(400, function() {
                $("#step_4").fadeIn();
            });
            $("li").addClass("active");
            for (let i = 1; i <= 4; i++) {
                $("#step_" + i + "_li").addClass("active");
            }
            shaq2go();
        }

    });

    $('.registration-form .btn-next').on('click', function() {
	var parent_fieldset = $(this).parents('fieldset');
	var next_step = true;

        $("input").removeClass('input-error');
        $("select").removeClass('input-error');

        parent_fieldset.find('input').each(function() {
	    if( $(this).val() == "" && $(this).prop('required')) {
		$(this).addClass('input-error');
		next_step = false;
	    }
	    if( this.id === 'form-from' && From.city === ''){
                $(this).addClass('input-error');
                next_step = false;
            }
	    if( this.id === 'form-to' &&  To.city === ''){
                $(this).addClass('input-error');
                next_step = false;
            }
            if ($("#form-contact-from-email").val() === "NA") {
                $("#form-contact-from-email").val($("#email").val());
            }
            if ($("#form-contact-to-email").val() === "NA") {
                $("#form-contact-to-email").val($("#email").val());
            }
	});

        if( next_step ) {
	    parent_fieldset.fadeOut(400, function() {
		$(this).next().fadeIn();
	    });
            $("li").removeClass("active");
            let id = parseInt(parent_fieldset.attr('id').split('_')[1])+1;
            for (let i = 1; i <= id; i++) {
                $("#step_" + i + "_li").addClass("active");
            }
            shaq2go();
	}

    });

    $('.registration-form .btn-previous').on('click', function() {
        var parent_fieldset = $(this).parents('fieldset');
	parent_fieldset.fadeOut(400, function() {
            $(this).prev().fadeIn();
	});
        if ($("#form-contact-from-email").val() === "NA") {
            $("#form-contact-from-email").val($("#email").val());
        }
        if ($("#form-contact-to-email").val() === "NA") {
            $("#form-contact-to-email").val($("#email").val());
        }

        $("li").removeClass("active");
        let id = parseInt(parent_fieldset.attr('id').split('_')[1]-1);
        for (let i = id; i > 0; i--) {
            $("#step_" + i + "_li").addClass("active");
        }
    });

    $(".glyphicon-th").on('click',function (e) {
        $("#create").hide();
        getUshaQs(db);
        $("#list").fadeIn('slow');
        $("#shaq-search").focus();
    });

    $(".glyphicon-home").on('click',function (e) {
        $("#create").fadeIn('slow');
        $("#list").hide();
    });

    var btn = $('#scrolltop');

$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});

btn.on('click', function(e) {
  e.preventDefault();
  $('html, body').animate({scrollTop:0}, '300');
});

$("#shaq-search").on('keyup', function (e) {
    if (e.keyCode === 13) {
      viewSearch();
    }
});

});
