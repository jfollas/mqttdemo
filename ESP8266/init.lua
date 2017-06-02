print("Starting in 5 seconds...")

function start()
  dofile("mqttdemo.lua")
end

tmr.create():alarm(5000, tmr.ALARM_SINGLE, start)



