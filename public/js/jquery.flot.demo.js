// demo chart #1
$(function () {
    var sin = [], cos = [];
    for (var i = 0; i < 14; i += 0.5) {
        sin.push([i, Math.sin(i)]);
        cos.push([i, Math.cos(i)]);
    }

    var plot = $.plot($("#chart-1"),
           [ { data: sin, label: "sin(x)"}, { data: cos, label: "cos(x)" } ], {
               series: {
                   lines: { show: true },
                   points: { show: true }
               },
               grid: { hoverable: true, clickable: true },
               yaxis: { min: -1.2, max: 1.2 }
             });

    function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    }

    var previousPoint = null;
    $("#chart-1").bind("plothover", function (event, pos, item) {
        if ($("#enablePosition:checked").length > 0) {
            var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
            $("#hoverdata").text(str);
        }

        if ($("#enableTooltip:checked").length > 0) {
            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;
                    
                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);
                    
                    showTooltip(item.pageX, item.pageY,
                                item.series.label + " of " + x + " = " + y);
                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;            
            }
        }
    });

    $("#placeholder").bind("plotclick", function (event, pos, item) {
        if (item) {
            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
            plot.highlight(item.series, item.datapoint);
        }
    });
});

// demo chart #2
$(function () {
    var d1 = [];
    for (var i = 0; i < 14; i += 0.5)
        d1.push([i, Math.sin(i)]);

    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];

    var d3 = [];
    for (var i = 0; i < 14; i += 0.5)
        d3.push([i, Math.cos(i)]);

    var d4 = [];
    for (var i = 0; i < 14; i += 0.1)
        d4.push([i, Math.sqrt(i * 10)]);
    
    var d5 = [];
    for (var i = 0; i < 14; i += 0.5)
        d5.push([i, Math.sqrt(i)]);

    var d6 = [];
    for (var i = 0; i < 14; i += 0.5 + Math.random())
        d6.push([i, Math.sqrt(2*i + Math.sin(i) + 5)]);
                        
    $.plot($("#chart-2"), [
        {
            data: d1,
            lines: { show: true, fill: true }
        },
        {
            data: d2,
            bars: { show: true }
        },
        {
            data: d3,
            points: { show: true }
        },
        {
            data: d4,
            lines: { show: true }
        },
        {
            data: d5,
            lines: { show: true },
            points: { show: true }
        },
        {
            data: d6,
            lines: { show: true, steps: true }
        }
    ]);
});

// demo chart #3
$.plot(
   $("#chart-3"),
   [
     {
       label: "Documents",
       data: 44   
     },
     {
       label: "Entries",
       data: 10
     },
     {
       label: "Reviews",
       data: 12
     },
     {
        label: "Rejected",
        data: 10
     }
   ],
   {
     series: {
       pie: {
         show: true,
         label: {
           show: false
         }
     }
    },
    legend: {
      show: true
    }
  }
);

// demo chart #4
$(function () {
    var d1 = [];
    for (var i = 0; i < 14; i += 0.5)
        d1.push([i, Math.sin(i)]);

    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];

    // a null signifies separate line segments
    var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
    
    $.plot($("#chart-4"), [ d1, d2, d3 ]);
});