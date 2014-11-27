!function() {

var body = d3.select("body"),
    height,
    clientY0,
    pageY0,
    pageYMin = 0,
    pageYMax,
    dragSamples;

var page = d3.selectAll(".page")
    .text(function(d, i) { return i; });

d3.select(window)
    .on("resize", resized)
    .on("touchstart", touchstarted)
    .on("touchmove", touchmoved)
    .on("touchend", touchended);

// iOS reports the wrong innerHeight on load!
d3.timer(function() {
  resized();
  return true;
});

function resized() {
  var height0 = height;
  height = innerHeight;
  page.style("height", height + "px");
  body.style("font", (height * .4) + "px/" + (height * .9) + "px sans-serif");
  pageYMax = (page.size() - 1) * height;
  if (height0) scrollTo(0, Math.max(0, Math.min(page.size() - 1, Math.round(pageYOffset / height0))) * height);
}

function touchstarted() {
  dragSamples = [];
  clientY0 = d3.event.changedTouches[0].clientY;
  pageY0 = pageYOffset;
  d3.event.preventDefault();
  body.interrupt();
    console.log('touchstarted');

}

function touchmoved() {
  var clientY1 = d3.event.changedTouches[0].clientY,
      pageY1 = pageY0 + clientY0 - clientY1;
  if (pageY1 < pageYMin) {
    if (pageYOffset > pageYMin) scrollTo(0, pageYMin);
    body.style("-webkit-transform", "translate3d(0," + -(pageY1 - pageYMin) / 3 + "px,0)");
  } else if (pageY1 > pageYMax) {
    if (pageYOffset < pageYMax) scrollTo(0, pageYMax);
    body.style("-webkit-transform", "translate3d(0," + -(pageY1 - pageYMax) / 3 + "px,0)");
  } else {
    scrollTo(0, pageY1);
  }
  if (dragSamples.push({y: pageY1, t: Date.now()}) > 8) dragSamples.shift();

  console.log('touchmoved');

}

function touchended() {
  var s0 = dragSamples.shift(),
      s1 = dragSamples.pop(),
      t1 = Date.now(),
      y = pageYOffset;

  while (s0 && (t1 - s0.t > 350)) s0 = dragSamples.shift();

  if (s0 && s1) {
    var vy = (s1.y - s0.y) / (s1.t - s0.t);
    if (vy > .5) y = Math.ceil(y / height) * height;
    else if (vy < -.5) y = Math.floor(y / height) * height;
  }

  y = Math.max(0, Math.min(page.size() - 1, Math.round(y / height))) * height;

  body.transition()
      .duration(500)
      .ease("cubic-out")
      .styleTween("-webkit-transform", function() {
        if (s1) {
          var i;
          if (s1.y < pageYMin) i = d3.interpolateNumber(-(s1.y - pageYMin) / 3, 0);
          if (s1.y > pageYMax) i = d3.interpolateNumber(-(s1.y - pageYMax) / 3, 0);
          return i && function(t) { return "translate3d(0," + i(t) + "px,0)"; };
        }
      })
      .tween("scroll", function() {
        var i = d3.interpolateNumber(pageYOffset, y);
        return function(t) { scrollTo(0, i(t)); };
      });

      console.log('end');
}

}()