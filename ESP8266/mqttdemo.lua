function start_mqtt()
  print("Attempting to connect to MQTT...");

  client:lwt("status/" .. node.chipid(), "offline", 0, 1)
  client:on("connect", start_polling)
  client:on("offline", stop_polling)

  client:connect("192.168.43.250", 1883, 0, 0, mqtt_connected, mqtt_error)
end



function mqtt_connected(client)
  print("MQTT connected. Starting sensor polling...")
  client:publish("status/" .. node.chipid(), "online", 1, 1)
  start_polling()
end



function mqtt_connect_error(client, reason)
  print("MQTT Connect Error: " .. reason)

  stop_polling()
end



function start_polling()
  timer:start()
end



function stop_polling()
  timer:stop()
  tmr.create():alarm(10 * 1000, tmr.ALARM_SINGLE, start_mqtt)
end



function new_reading()
  local t, p, h = bme280.read()

  print("New Reading: ", t, p, h)

  -- Demonstrating Reporting by Exception
  if t ~= last_t then
    client:publish("temperature/" .. node.chipid(), t, 0, 1)
    last_t = t
  end

  if p ~= last_p then
    client:publish("pressure/" .. node.chipid(), p, 0, 1)
    last_p = p
  end

  if h ~= last_h then
    client:publish("humidity/" .. node.chipid(), h, 0, 1)
    last_h = h
  end

  -- Demonstrating how to encode data into JSON
  local ok, json = pcall(sjson.encode, { t = t, p = p, h = h })

  if ok then 
    client:publish("readings/" .. node.chipid(), json, 0, 1)
  end
end


---------------------------------------------------------
-- HERE IS WHERE THE SCRIPT ACTUALLY STARTS RUNNING FROM

print("Setting up...")

timer = tmr.create()
timer:register(5000, tmr.ALARM_AUTO, new_reading)

client = mqtt.Client(node.chipid(), 10)

bme280.init(1,2) -- SDA, SLC

last_t = 0
last_p = 0
last_h = 0

start_mqtt()

