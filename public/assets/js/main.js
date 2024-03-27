(function ($) {

    //################################## my codes#################
    $.ajax({
        dataType: "json",
        url: "/"
    })
    $("#myinput-search").on("input", function (value) {
        if ($("#myinput-search").val().length > 0) {
            $(".job-search-results").show(500);
            $("body").css("overflow", "hidden");
        }
        else {
            $(".job-search-results").hide(500);
            $("body").css("overflow", "auto");
        }
    });
    $(".loginregister").on("click", () => {
        console.log("clicked");
        $(".mainpage").hide(500);
        $(".loginpage").show(500);
    });
    $("#mainpagelink").on("click", () => {
        console.log("clicked");
        $(".mainpage").show(500);
        $(".loginpage").hide(500);
    });
    $("#verifytel").on("input", () => {
        if ($("#verifytel").val().length > 0) {
            $("#login1verifymobileinfos").css("display", "none");
        }
    })
    $("#codesend").on("click", (event) => {
        event.preventDefault();
        $("#login1verifymobileinfos").text("");
        if ($("#verifytel").val().length > 0) {
            $.ajax({
                url: "/verifytel",
                data: {
                    tel: $("#verifytel").val().trim()
                },
                type: "POST",
                dataType: "json",

                success: (data, textstatus, jqxhr) => {
                    if (textstatus == "success") {
                        $("#login1").hide(500);
                        $("#login2").show(500);
                        var temp = $("#login2verifymobileinfostemp").html();
                        let distance = data.time;
                        let x = setInterval(() => {
                            let min = Math.floor(distance / 60);
                            let sec = Math.floor(distance % 60);
                            $("#login2verifymobileinfosdiv").html(Mustache.render(temp, { minute: min, second: sec }));
                            distance--;
                            if (distance <= 0) {
                                clearInterval(x);
                                $("#login2verifymobileinfos").html(`کد ارسال شده منقضی شده است`);
                            }
                        }, 1000);


                    }
                },
                error: (iqxhr, textstatus, error) => {

                }
            })
        }
        else {
            console.log("Clickeddd");
            $("#verifymobileinfos").text("شماره همراه وارد نشده است");
            $("#verifymobileinfos").css({ "color": "orangered", "letter-spacing": "normal", "display": "block" });
        }
    })
    $("#sentcode").on("input", (value) => {
        if ($("#sentcode").val().length == 4) {
            console.log("okkkk");
        }
    });
    //#############################################################



    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $banner = $('#banner');

    // Breakpoints.
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });


    /**
     * Applies parallax scrolling to an element's background image.
     * @return {jQuery} jQuery object.
     */
    $.fn._parallax = (browser.name == 'ie' || browser.name == 'edge' || browser.mobile) ? function () { return $(this) } : function (intensity) {

        var $window = $(window),
            $this = $(this);

        if (this.length == 0 || intensity === 0)
            return $this;

        if (this.length > 1) {

            for (var i = 0; i < this.length; i++)
                $(this[i])._parallax(intensity);

            return $this;

        }

        if (!intensity)
            intensity = 0.25;

        $this.each(function () {

            var $t = $(this),
                on, off;

            on = function () {

                // $t.css('background-position', 'center 100%, center 100%, center 0px');

                $window
                    .on('scroll._parallax', function () {

                        var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

                        // $t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

                    });

            };

            off = function () {

                $t
                // .css('background-position', '');

                $window
                    .off('scroll._parallax');

            };

            breakpoints.on('<=medium', off);
            breakpoints.on('>medium', on);

        });

        $window
            .off('load._parallax resize._parallax')
            .on('load._parallax resize._parallax', function () {
                $window.trigger('scroll');
            });

        return $(this);

    };

    // Play initial animations on page load.
    $window.on('load', function () {
        window.setTimeout(function () {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Clear transitioning state on unload/hide.
    $window.on('unload pagehide', function () {
        window.setTimeout(function () {
            $('.is-transitioning').removeClass('is-transitioning');
        }, 250);
    });

    // Fix: Enable IE-only tweaks.
    if (browser.name == 'ie' || browser.name == 'edge')
        $body.addClass('is-ie');

    // Scrolly.
    $('.scrolly').scrolly({
        offset: function () {
            return $header.height() - 2;
        }
    });

    // Tiles.
    var $tiles = $('.tiles > article');


    // Header.
    if ($banner.length > 0
        && $header.hasClass('alt')) {

        $window.on('resize', function () {
            $window.trigger('scroll');
        });

        $window.on('load', function () {

            $banner.scrollex({
                bottom: $header.height() + 10,
                terminate: function () { $header.removeClass('alt'); },
                enter: function () { $header.addClass('alt'); },
                leave: function () { $header.removeClass('alt'); $header.addClass('reveal'); }
            });

            window.setTimeout(function () {
                $window.triggerHandler('scroll');
            }, 100);

        });

    }

    // Banner.
    $banner.each(function () {

        var $this = $(this),
            $image = $this.find('.image'), $img = $image.find('img');

        // Parallax.
        $this._parallax(0.275);

        // Image.
        if ($image.length > 0) {

            // Set image.
            $this.css('background-image', 'url(' + $img.attr('src') + ')');

            // Hide original.
            $image.hide();

        }

    });

    // Menu.
    var $menu = $('#menu'),
        $menuInner;

    $menu.wrapInner('<div class="inner"></div>');
    $menuInner = $menu.children('.inner');
    $menu._locked = false;

    $menu._lock = function () {

        if ($menu._locked)
            return false;

        $menu._locked = true;

        window.setTimeout(function () {
            $menu._locked = false;
        }, 350);

        return true;

    };

    $menu._show = function () {

        if ($menu._lock())
            $body.addClass('is-menu-visible');

    };

    $menu._hide = function () {

        if ($menu._lock())
            $body.removeClass('is-menu-visible');

    };

    $menu._toggle = function () {

        if ($menu._lock())
            $body.toggleClass('is-menu-visible');

    };

    $menuInner
        .on('click', function (event) {
            event.stopPropagation();
        })
        .on('click', 'a', function (event) {

            var href = $(this).attr('href');

            event.preventDefault();
            event.stopPropagation();

            // Hide.
            $menu._hide();

            // Redirect.
            window.setTimeout(function () {
                window.location.href = href;
            }, 250);

        });

    $menu
        .appendTo($body)
        .on('click', function (event) {

            event.stopPropagation();
            event.preventDefault();

            $body.removeClass('is-menu-visible');

        })
        .append('<a class="close" href="#menu">Close</a>');

    $body
        .on('click', 'a[href="#menu"]', function (event) {

            event.stopPropagation();
            event.preventDefault();

            // Toggle.
            $menu._toggle();

        })
        .on('click', function (event) {

            // Hide.
            $menu._hide();

        })
        .on('keydown', function (event) {

            // Hide on escape.
            if (event.keyCode == 27)
                $menu._hide();

        });

})(jQuery);