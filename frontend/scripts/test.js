var v,
  v2,
  language = "en",
  v_mute = !1,
  v2_mute = !1,
  Fullscreen = !1,
  webkitFullscreen = 0,
  xml_captions = [],
  audio = new Audio();
function initVideo() {
  v.pause(),
    $("#video").show(),
    document.querySelector("#video").load(),
    (v = document.getElementById("video")),
    (currentspeaker = "initial"),
    $("#language_1").html(""),
    $("#language_2").html(""),
    $("#language_3").html(""),
    $("#step1_movie .playbutton").fadeIn(150),
    v.addEventListener("ended", function () {
      $("#step1_movie .playbutton").fadeIn(150),
        $("#step1_movie .play").removeClass("on");
    }),
    v.addEventListener("pause", function () {
      $("#step1_movie .playbutton").fadeIn(150);
    }),
    v.readyState > 0 || v.addEventListener("loadedmetadata", function () {}),
    v.addEventListener("volumechange", function () {
      v_mute =
        !!v.muted &&
        !$("#step1_captions.cando_movie_captions").hasClass("v_changed");
    }),
    v2.addEventListener("volumechange", function () {
      v2_mute =
        !!v2.muted &&
        !$("#step2_captions.cando_movie_captions").hasClass("v_changed");
    }),
    $("#step1_movie .playbutton").on("click", function () {
      playVideo();
    });
}
function initVideo2() {
  v2.pause(),
    $("#video2").show(),
    document.querySelector("#video2").load(),
    (v2 = document.getElementById("video2")),
    (currentspeaker2 = "initial"),
    $("#language_c1").html(""),
    $("#language_c2").html(""),
    $("#language_c3").html(""),
    $("#step2_movie .playbutton").fadeIn(150),
    v2.addEventListener("ended", function () {
      $("#step2_movie .playbutton").fadeIn(150),
        $("#step2_movie .play").removeClass("on");
    }),
    v2.addEventListener("pause", function () {
      $("#step2_movie .playbutton").fadeIn(150);
    }),
    v2.readyState > 0 || v2.addEventListener("loadedmetadata", function () {}),
    v2.addEventListener("volumechange", function () {
      v2_mute =
        !!v2.muted &&
        !$("#step2_captions.cando_movie_captions").hasClass("v_changed");
    }),
    $("#step2_movie .playbutton").on("click", function () {
      playVideo2();
    });
}
function promVideo() {
  v.addEventListener("timeupdate", function () {
    (webkitFullscreen = !!v.webkitDisplayingFullscreen),
      captions_control(v.currentTime);
  });
}
function promVideo2() {
  v2.addEventListener("timeupdate", function () {
    (webkitFullscreen = !!v2.webkitDisplayingFullscreen),
      captions_control2(v2.currentTime);
  });
}
function promcaptions() {
  $(".cando_movie_changer")[0] &&
    $(".cando_movie_changer li").each(function () {
      var e,
        a = $(this).children("img").attr("src").split("/"),
        t = a[a.length - 1].split(".");
      (caption_arr = []),
        $(xmlRead("assets/data/topics/" + t[0] + ".xml"))
          .find("renshu")
          .find("video")
          .find("cue")
          .each(function () {
            (caption_arr[$(this).index()] = []),
              (caption_arr[$(this).index()].time = $(this).attr("time"));
            var e = $(this).attr("person");
            0 == $(this).attr("time") ? (e = "initial") : "" == e && (e = "m"),
              (caption_arr[$(this).index()].captionstatus = [
                e,
                $(this).find("ja").find("first").text(),
                $(this).find("ja").find("second").text(),
                $(this).find("ro").find("first").text(),
                $(this).find("ro").find("second").text(),
                $(this).find("en").find("first").text(),
                $(this).find("en").find("second").text(),
                $(this).find("es").find("first").text(),
                $(this).find("es").find("second").text(),
              ]);
          }),
        (xml_captions[t[0]] = caption_arr);
    });
}
function promcaptions2() {
  if ($(".cando_movie_player.challenge")[0]) {
    var e,
      a = $(".cando_movie_player.challenge")
        .find("source")
        .eq(0)
        .attr("src")
        .split("/"),
      t = a[a.length - 1].split(".");
    (caption_arr = []),
      $(xmlRead("assets/data/topics/" + t[0] + ".xml"))
        .find("challenge")
        .find("video")
        .find("cue")
        .each(function () {
          (caption_arr[$(this).index()] = []),
            (caption_arr[$(this).index()].time = $(this).attr("time"));
          var e = $(this).attr("person");
          0 == $(this).attr("time") ? (e = "initial") : "" == e && (e = "m"),
            (caption_arr[$(this).index()].captionstatus = [
              e,
              $(this).find("ja").find("first").text(),
              $(this).find("ja").find("second").text(),
              $(this).find("ro").find("first").text(),
              $(this).find("ro").find("second").text(),
              $(this).find("en").find("first").text(),
              $(this).find("en").find("second").text(),
              $(this).find("es").find("first").text(),
              $(this).find("es").find("second").text(),
            ]);
        }),
      (xml_captions[t[0]] = caption_arr);
  }
}
$(function () {
  (v = document.getElementById("video")),
    (v2 = document.getElementById("video2")),
    $("#video")[0] && (promcaptions(), promVideo(), initVideo()),
    $("#video2")[0] && (promcaptions2(), promVideo2(), initVideo2()),
    cando_question(),
    changerVideo();
});
var b = !1;
function playVideo() {
  b
    ? (v.play(),
      $("#step1_movie .playbutton").fadeOut(150),
      $("#step1_movie .control .play").addClass("on"))
    : v.paused
    ? (v.play(),
      $("#step1_movie .playbutton").fadeOut(150),
      $("#step1_movie .control .play").addClass("on"))
    : (v.pause(),
      $("#step1_movie .playbutton").fadeIn(150),
      $("#step1_movie .control .play").removeClass("on"));
}
function pauseVideo(e) {
  v.pause(),
    $("#step1_movie .control .play").removeClass("on"),
    setTimeout(function () {
      webkitFullscreen = !!v.webkitDisplayingFullscreen;
    }, 1e3);
}
function seekVideo(e) {
  (v.currentTime = e.value), captions_control(v.currentTime, !0);
}
function rewindVideo() {
  (v.currentTime = 0),
    v.pause(),
    $("#step1_movie .playbutton").fadeIn(150),
    $("#step1_movie .control .play").removeClass("on"),
    $("#language_1").html(""),
    $("#language_2").html(""),
    $("#language_3").html("");
}
function mute(e) {
  !1 === v_mute
    ? $("#step1_captions.cando_movie_captions").hasClass("voice_" + e) ||
      "m" == e ||
      "" == e ||
      "initial" == e
      ? ($("#step1_captions.cando_movie_captions")
          .removeClass("v_change")
          .removeClass("v_changed"),
        (v.muted = !1))
      : !0 === webkitFullscreen ||
        !0 === Fullscreen ||
        ($("#step1_captions.cando_movie_captions").hasClass("v_changed") ||
          ($("#step1_captions.cando_movie_captions")
            .addClass("v_change")
            .addClass("v_changed"),
          setTimeout(function () {
            $("#step1_captions.cando_movie_captions").removeClass("v_change");
          }, 100)),
        (v.muted = !0))
    : (v.muted = !0);
}
function playVideo2(e) {
  e
    ? (v2.play(),
      $("#step2_movie .playbutton").fadeOut(150),
      $("#step2_movie .control .play").addClass("on"))
    : v2.paused
    ? (v2.play(),
      $("#step2_movie .playbutton").fadeOut(150),
      $("#step2_movie .control .play").addClass("on"))
    : (v2.pause(),
      $("#step2_movie .playbutton").fadeIn(150),
      $("#step2_movie .control .play").removeClass("on"));
}
function pauseVideo2() {
  v2.pause(),
    $("#step2_movie .control").removeClass("on"),
    setTimeout(function () {
      webkitFullscreen = !!v2.webkitDisplayingFullscreen;
    }, 1e3);
}
function seekVideo2(e) {
  (v2.currentTime = e.value), captions_control2(v2.currentTime, !0);
}
function rewindVideo2() {
  (v2.currentTime = 0),
    v2.pause(),
    $("#step2_movie .movie").removeClass("play"),
    $("#step2_movie .control").removeClass("on"),
    $("#language_c1").html(""),
    $("#language_c2").html(""),
    $("#language_c3").html("");
}
function mute2(e) {
  !1 === v2_mute
    ? $("#step2_captions.cando_movie_captions").hasClass("voice_" + e) ||
      "m" == e ||
      "" == e ||
      "initial" == e
      ? (v2.muted = !1)
      : !0 === webkitFullscreen || !0 === Fullscreen || (v2.muted = !0)
    : (v2.muted = !0);
}
function captions(e) {
  "m" == e[0]
    ? ($("#step1_captions .speaker_wrap")
        .removeClass("speaker_a , speaker_b")
        .addClass("speaker_m"),
      $("#language_1").html('<span class="speaker">' + e[1] + "</span>" + e[2]),
      $("#language_2").html('<span class="speaker">' + e[3] + "</span>" + e[4]),
      "en" == language &&
        $("#language_3").html(
          '<span class="speaker">' + e[5] + "</span>" + e[6]
        ),
      "es" == language &&
        $("#language_3").html(
          '<span class="speaker">' + e[7] + "</span>" + e[8]
        ))
    : "A" == e[0] || "B" == e[0]
    ? ($("#step1_captions .speaker_wrap")
        .removeClass("speaker_a , speaker_b , speaker_m")
        .addClass("speaker_" + e[0].toLowerCase()),
      $("#language_1").html('<span class="speaker">' + e[1] + "</span>" + e[2]),
      $("#language_2").html('<span class="speaker">' + e[3] + "</span>" + e[4]),
      "en" == language &&
        $("#language_3").html(
          '<span class="speaker">' + e[5] + "</span>" + e[6]
        ),
      "es" == language &&
        $("#language_3").html(
          '<span class="speaker">' + e[7] + "</span>" + e[8]
        ))
    : ($("#step1_captions .speaker_wrap")
        .removeClass("speaker_a , speaker_b")
        .addClass("speaker_m"),
      $("#language_1").html(""),
      $("#language_2").html(""),
      $("#language_3").html("")),
    $("#step1_captions.cando_movie_captions p .speaker").removeAttr("style"),
    $("#step1_captions.cando_movie_captions p .speaker").innerWidth(
      Math.max(
        $(
          "#step1_captions.cando_movie_captions .language_1 .speaker"
        ).innerWidth(),
        $(
          "#step1_captions.cando_movie_captions .language_2 .speaker"
        ).innerWidth(),
        $(
          "#step1_captions.cando_movie_captions .language_3 .speaker"
        ).innerWidth()
      ) + 50
    );
}
function captions2(e) {
  "m" == e[0]
    ? ($("#step2_captions .speaker_wrap")
        .removeClass("speaker_a , speaker_b")
        .addClass("speaker_m"),
      $("#language_c1").html(
        '<span class="speaker">' + e[1] + "</span>" + e[2]
      ),
      $("#language_c2").html(
        '<span class="speaker">' + e[3] + "</span>" + e[4]
      ),
      "en" == language &&
        $("#language_c3").html(
          '<span class="speaker">' + e[5] + "</span>" + e[6]
        ),
      "es" == language &&
        $("#language_c3").html(
          '<span class="speaker">' + e[7] + "</span>" + e[8]
        ))
    : "A" == e[0] || "B" == e[0]
    ? ($("#step2_captions .speaker_wrap")
        .removeClass("speaker_a , speaker_b , speaker_m")
        .addClass("speaker_" + e[0].toLowerCase()),
      $("#language_c1").html(
        '<span class="speaker">' + e[1] + "</span>" + e[2]
      ),
      $("#language_c2").html(
        '<span class="speaker">' + e[3] + "</span>" + e[4]
      ),
      "en" == language &&
        $("#language_c3").html(
          '<span class="speaker">' + e[5] + "</span>" + e[6]
        ),
      "es" == language &&
        $("#language_c3").html(
          '<span class="speaker">' + e[7] + "</span>" + e[8]
        ))
    : ($("#step2_captions .speaker_wrap")
        .removeClass("speaker_a , speaker_b")
        .addClass("speaker_m"),
      $("#language_c1").html(""),
      $("#language_c2").html(""),
      $("#language_c3").html("")),
    $("#step2_captions.cando_movie_captions p .speaker").removeAttr("style"),
    $("#step2_captions.cando_movie_captions p .speaker").innerWidth(
      Math.max(
        $(
          "#step2_captions.cando_movie_captions .language_1 .speaker"
        ).innerWidth(),
        $(
          "#step2_captions.cando_movie_captions .language_2 .speaker"
        ).innerWidth(),
        $(
          "#step2_captions.cando_movie_captions .language_3 .speaker"
        ).innerWidth()
      ) + 50
    );
}
var speak = "",
  speak2 = "",
  currentspeaker = "initial",
  currentspeaker2 = "initial",
  captionstatus = [],
  captionstatus2 = [];
function captions_control(e, a) {
  for (
    var t = $("#video source.mp4").attr("src").split("/"),
      n = t[t.length - 1].split(".")[0],
      s = 1;
    s < xml_captions[n].length;
    s++
  )
    xml_captions[n][s - 1].time < e &&
      e < xml_captions[n][s].time &&
      ((speak = xml_captions[n][s - 1].captionstatus[0].toLowerCase()),
      (captionstatus = xml_captions[n][s - 1].captionstatus));
  captions(captionstatus), (currentspeaker = speak), mute(speak);
}
function captions_control2(e, a) {
  for (
    var t = $("#video2 source.mp4").attr("src").split("/"),
      n = t[t.length - 1].split(".")[0],
      s = 1;
    s < xml_captions[n].length;
    s++
  )
    xml_captions[n][s - 1].time < e &&
      e < xml_captions[n][s].time &&
      ((speak2 = xml_captions[n][s - 1].captionstatus[0].toLowerCase()),
      (captionstatus2 = xml_captions[n][s - 1].captionstatus));
  captions2(captionstatus2), (currentspeaker2 = speak2), mute2(speak2);
}
function activator(e, a, t) {
  !0 == t
    ? $("#step1_captions.cando_movie_captions").addClass(e + a)
    : $("#step1_captions.cando_movie_captions").removeClass(e + a),
    $("#step1_captions.cando_movie_captions p .speaker").removeAttr("style"),
    $("#step1_captions.cando_movie_captions p .speaker").innerWidth(
      Math.max(
        $(
          "#step1_captions.cando_movie_captions .language_1 .speaker"
        ).innerWidth(),
        $(
          "#step1_captions.cando_movie_captions .language_2 .speaker"
        ).innerWidth(),
        $(
          "#step1_captions.cando_movie_captions .language_3 .speaker"
        ).innerWidth()
      ) + 50
    );
}
function activator2(e, a, t) {
  !0 == t
    ? $("#step2_captions.cando_movie_captions").addClass(e + a)
    : $("#step2_captions.cando_movie_captions").removeClass(e + a),
    $("#step2_captions.cando_movie_captions p .speaker").removeAttr("style"),
    $("#step2_captions.cando_movie_captions p .speaker").innerWidth(
      Math.max(
        $(
          "#step2_captions.cando_movie_captions .language_1 .speaker"
        ).innerWidth(),
        $(
          "#step2_captions.cando_movie_captions .language_2 .speaker"
        ).innerWidth(),
        $(
          "#step2_captions.cando_movie_captions .language_3 .speaker"
        ).innerWidth()
      ) + 50
    );
}
function f_requestFullscreen(e) {
  var a = $("#video source.mp4").attr("src").split("/");
  a[a.length - 1].split("."),
    v.requestFullscreen
      ? (pauseVideo(), (v.currentTime = 0), v.play(), v.requestFullscreen())
      : v.webkitRequestFullscreen
      ? (pauseVideo(),
        (v.currentTime = 0),
        v.play(),
        v.webkitRequestFullscreen())
      : v.webkitEnterFullscreen
      ? (pauseVideo(), (v.currentTime = 0), v.play(), v.webkitEnterFullscreen())
      : v.mozRequestFullScreen
      ? (pauseVideo(), (v.currentTime = 0), v.play(), v.mozRequestFullScreen())
      : v.msRequestFullscreen
      ? (pauseVideo(), (v.currentTime = 0), v.play(), v.msRequestFullscreen())
      : v.webkitDisplayingFullscreen
      ? (pauseVideo(),
        (v.currentTime = 0),
        v.play(),
        v.webkitDisplayingFullscreen())
      : alert("お使いのブラウザでは、全画面表示が許可されていません。");
}
function f_requestFullscreen2() {
  var e = $("#video2 source.mp4").attr("src").split("/");
  e[e.length - 1].split("."),
    v2.requestFullscreen
      ? (pauseVideo2(), (v2.currentTime = 0), v2.play(), v2.requestFullscreen())
      : v2.webkitRequestFullscreen
      ? (pauseVideo(),
        (v2.currentTime = 0),
        v2.play(),
        v2.webkitRequestFullscreen())
      : v2.webkitEnterFullscreen
      ? (pauseVideo(),
        (v2.currentTime = 0),
        v2.play(),
        v2.webkitEnterFullscreen())
      : v2.mozRequestFullScreen
      ? (pauseVideo(),
        (v2.currentTime = 0),
        v2.play(),
        v2.mozRequestFullScreen())
      : v2.msRequestFullscreen
      ? (pauseVideo(),
        (v2.currentTime = 0),
        v2.play(),
        v2.msRequestFullscreen())
      : v2.webkitDisplayingFullscreen
      ? (pauseVideo(),
        (v2.currentTime = 0),
        v2.play(),
        v2.webkitDisplayingFullscreen())
      : alert("お使いのブラウザでは、全画面表示が許可されていません。");
}
function handleFSevent() {
  (document.webkitFullscreenElement &&
    null !== document.webkitFullscreenElement) ||
  (document.mozFullScreenElement && null !== document.mozFullScreenElement) ||
  (document.msFullscreenElement && null !== document.msFullscreenElement) ||
  (document.fullScreenElement && null !== document.fullScreenElement)
    ? ((textTracks = null != v ? v.textTracks : v2.textTracks),
      (Fullscreen = !0))
    : ((textTracks = null != v ? v.textTracks : v2.textTracks),
      null != v
        ? (v.pause(), v2.pause(), (v.currentTime = 0), (v2.currentTime = 0))
        : (v2.pause(), (v2.currentTime = 0)),
      (Fullscreen = !1));
}
function changerVideo() {
  $(".cando_movie_changer li").on("click", function () {
    if (!$(this).hasClass("active")) {
      var e = $(this).children("img").attr("src").split("/"),
        a = e[e.length - 1].split(".");
      $("#video").attr(
        "poster",
        "assets/movies/thumbnail/topics/" + a[0] + ".jpg"
      ),
        $("#video source.mp4").attr(
          "src",
          "assets/movies/topics/" + a[0] + ".mp4"
        ),
        $("#video source.webm").attr(
          "src",
          "assets/movies/topics/" + a[0] + ".webm"
        ),
        v.load(),
        $(".speaker_wrap").children("p").html(""),
        $(".cando_movie_changer li").removeClass("active"),
        $(this).addClass("active"),
        $("#step1_movie .playbutton").fadeIn(150),
        $("#step1_movie .control .play").removeClass("on");
    }
  });
}
function xmlRead(e) {
  var a;
  return (
    $.ajax({
      url: e,
      dataType: "xml",
      async: !1,
      cache: !1,
      timeout: 1e3,
    })
      .done(function (e) {
        a = e;
      })
      .fail(function (e) {}),
    a
  );
}
function cando_question() {
  var e;
  !$(".cando_question")[0] ||
    ($(".cando_question > ul").on("init , afterChange", function () {
      $(".slick-current").hasClass("answer")
        ? $(".slick-next").removeClass("sample").addClass("answer")
        : $(".slick-active").hasClass("sample")
        ? $(".slick-next").removeClass("answer").addClass("sample")
        : $(".slick-next").removeClass("sample").removeClass("answer"),
        $(".slick-current").hasClass("title_change") &&
          $(".cando_question")
            .prev("h2")
            .children("span")
            .html($(".slick-current").attr("data-titlehtml"));
    }),
    (e = !$(".cando_question > ul").hasClass("dots_off")),
    "sp" == deviceCheck()
      ? $(".cando_question .slick-track")[0] ||
        $(".cando_question > ul").slick({
          infinite: !1,
          vertical: !1,
          speed: 0,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: e,
          dotsClass: "indicator",
          arrows: !0,
          pauseOnHover: !0,
          draggable: !1,
          autoplay: !1,
          adaptiveHeight: !0,
        })
      : $(".cando_question .slick-track")[0] ||
        $(".cando_question > ul").slick({
          infinite: !1,
          vertical: !1,
          speed: 0,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: e,
          dotsClass: "indicator",
          arrows: !0,
          pauseOnHover: !0,
          draggable: !1,
          touchMove: !0,
          swipe: !0,
          autoplay: !1,
          adaptiveHeight: !0,
        }));
}
function muteVideo() {
  v_mute
    ? ((v_mute = !1), $("#step1_movie .mute").removeClass("on"))
    : ((v_mute = !0), $("#step1_movie .mute").addClass("on"));
}
function muteVideo2() {
  v2.muted
    ? ((v2_mute = !1), $("#step2_movie .mute").removeClass("on"))
    : ((v2_mute = !0), $("#step2_movie .mute").addClass("on"));
}
function Beam_me_up() {
  $(".cando_question .contents img").addClass("cando_questionimage"),
    $("span.cando_questionimage_wrap").each(function () {
      $(this).parent("a").removeAttr("style"),
        $(this).removeAttr("style"),
        $(this)
          .children("img.cando_questionimage")
          .show()
          .unwrap('<span class="cando_questionimage_wrap" />');
    }),
    $("img.cando_questionimage").each(function () {
      (_this = $(this)).wrap('<span class="cando_questionimage_wrap" />'),
        $(this)
          .parent(".cando_questionimage_wrap")
          .width(_this.innerWidth())
          .css({
            "background-image": "url(" + _this.attr("src") + ")",
            display: "inline-block",
            "padding-bottom":
              (_this.innerHeight() / _this.innerWidth()) * 100 + "%",
          })
          .height("1"),
        $(this).hide();
    });
}
document.addEventListener("webkitfullscreenchange", handleFSevent, !1),
  document.addEventListener("mozfullscreenchange", handleFSevent, !1),
  document.addEventListener("MSFullscreenChange", handleFSevent, !1),
  document.addEventListener("fullscreenchange", handleFSevent, !1),
  $(window).on("load resize orientationchange", function () {
    Beam_me_up(), "sp" == deviceCheck() && setTimeout(Beam_me_up, 100);
  });
