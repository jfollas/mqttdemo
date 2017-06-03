(function () {

  // Create a client instance
  let client = new Paho.MQTT.Client(
    "localhost",          // host
    Number(3000),         // port
    "paho_demo_client_id" // client id
  )

  // set callback handlers
  client.onConnectionLost = onConnectionLost
  client.onMessageArrived = onMessageArrived
  client.onMessageDelivered = onMessageDelivered

  // Last Will and Testament message
  let willMessage = new Paho.MQTT.Message("Elvis has left the building")
  willMessage.destinationName = "disconnects"


  // connect the client
  client.connect({
    onSuccess: onConnect,
    onFailure: onConnectFailure,
    cleanSession: false,
    willMessage: willMessage
  })


  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    toastr.success("onConnect")
    client.subscribe("general")
    //client.subscribe("temperature/+")
    //client.subscribe("pressure/+")
    //client.subscribe("humidity/+")
    client.subscribe("status/+")
    client.subscribe("readings/+")
  }

  // called when the client connect fails
  function onConnectFailure(res) {
    toastr.error(`Connect Failed: Code=${res.errorCode} message=${res.errorMessage}`)
  }

  // called when the client loses its connection
  function onConnectionLost(res) {
    toastr.warning(`Connection Lost: Code=${res.errorCode} message=${res.errorMessage}`)
  }

  // called when a message arrives
  function onMessageArrived(message) {
    toastr.info(`Message Arrived: ${message.destinationName}: ${message.payloadString}`)

    if (setReading[message.destinationName] != null) {
      setReading[message.destinationName](message.payloadString)
    }

    if (setStatus[message.destinationName] != null) {
      setStatus[message.destinationName](message.payloadString)
    }
  }

  // called when a message is delivered
  function onMessageDelivered(message) {
    toastr.info(`Message Sent: ${message.payloadString}`)
  }

  document.getElementById("btnHello").onclick = function () {
    message = new Paho.MQTT.Message("Hello")
    message.destinationName = "general"
    client.send(message)
  }


  toastr.options.newestOnTop = false

  let chartData = {
    datasets: [
      {
        xAxisID: "timeAxis",   
        yAxisID: "tempScale",     
        label: "Temperature",
        backgroundColor: "transparent",
        borderColor: "rgba(255,0,0,0.8)",
        pointRadius: 0,
        data: []
      },
      {
        xAxisID: "timeAxis",   
        yAxisID: "pressureScale",         
        label: "Pressure",
        backgroundColor: "rgba(0,0,255,0.25)",
        borderColor: "rgba(0,0,255,0.5)",
        data: []
      },
      {
        xAxisID: "timeAxis",   
        yAxisID: "humidityScale",         
        label: "Humidity",
        backgroundColor: "rgba(0,255,0,0.10)",
        borderColor: "transparent",
        pointRadius: 0,
        data: []
      }      
    ]
  }

  let myChart = new Chart("myChart", {
    type: 'line',
    data: chartData,
    options: {
      scales: {
        xAxes: [{
          id: 'timeAxis',
          type: 'time',
          time: {
            unit: 'second',
            min: moment().subtract(5, "minute").startOf("minute"),
            unit: 'minute'
          },
        }],
        yAxes: [{
          id: 'tempScale',
          type: 'linear',
          position: 'left',
          ticks: {
            min: 0,
            max: 100
          }
        }, {
          id: 'pressureScale',
          type: 'linear',
          position: 'right',
          ticks: {
            min: 28,
            max: 32
          },
          gridLines: {
            display: false
          }
        }, {
          id: 'humidityScale',
          type: 'linear',
          position: 'right',
          display: false,
          ticks: {
            min: 0,
            max: 100
          },
        }]
      }
    }
  })

  function updateChartData(d) {
    if (d.t != null) {
      chartData.datasets[0].data.push({x:moment(), y: d.t})
    }
    if (d.p != null) {
      chartData.datasets[1].data.push({x:moment(), y: d.p})
    }
    if (d.h != null) {
      chartData.datasets[2].data.push({x:moment(), y: d.h})
    }    
    myChart.options.scales.xAxes[0].time.min = moment().subtract(5, "minute").startOf("minute")
    myChart.update()
  }  

  // Just a quick and dirty way to handle new data from specific topics
  setReading = {
    "temperature/403539": function(val) {
      let c = Math.round(val / 10.0) / 10
      let f = Math.round(320 + 90 * val / 500) / 10
      updateChartData ({t: f})
      $("#temperatureReading").html(`${c}°C <small>(${f}°F)</small>`)
    },
    "pressure/403539": function(val) {
      let hpa = Math.round(val / 10.0) / 100
      let psi = Math.round(val * 0.002953) / 100
      updateChartData ({p: psi})
      $("#pressureReading").html(`${hpa} hPa <small>(${psi} psi)</small>`)
    },
    "humidity/403539": function(val) {
      let h = val / 1000.0
      updateChartData ({h: h})    
      $("#humidityReading").text(`${h}%`)
    },
    "readings/403539": function(val) {
      let data = JSON.parse(val)
      setReading["temperature/403539"](data.t)
      setReading["pressure/403539"](data.p)
      setReading["humidity/403539"](data.h)            
    }
  }

  setStatus = {
    "status/403539": function(status) {
      if (status.toLowerCase() === "online") {
        $("#statusText").html("<i class='fa fa-bolt text-success'></i> Online")
      } 
      else if (status.toLowerCase() === "offline") {
        $("#statusText").html("<i class='fa fa-times-circle text-danger'></i> Offline")
      }
      else {
        $("#statusText").text(status)
      }
      
    }
  }
})()