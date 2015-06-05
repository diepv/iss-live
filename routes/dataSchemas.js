/**
 * Created by viviandiep on 5/24/15.
 */

var Schematic = function(identificationCode){
    this.name = identificationCode || '';
    this.console = '';
    this.tmtc = '';
    this.units = '';
    this.columns = '';
    this.descShort = '';
    this.descLong = '';


    this.setScheme= function(dataId){
        //fetches scheme based on the name given (dataId);
        var scheme = nodes[dataId];
        this.console = scheme[0];
        this.tmtc = scheme[1];
        this.units = scheme[2];
        this.columns = scheme[3];
        this.descShort = scheme[6];
        this.descLong = scheme[7];
    };

    this.setScheme(identificationCode);

    var nodes = {
        "NODE2000001": ["ETHOS", "N2_MTL", "kg", "12", "sprintf","%5.4f", "Coolant water quantity (Node 2), MT", "Coolant water quantity (Node 2), MT. N2 Moderate Temperature Loop (MTL) water level"],
        "NODE2000002":["ETHOS","N2_LTL","kg","12","sprintf","%5.4f","Coolant water quantity (Node 2), LT","Coolant water quantity (Node 2), LT. N2 Low Temperature Loop (LTL) water level."],
        "NODE2000003":["ETHOS","N2_AC","event","64","enum","0=RESET|1=DRAIN|2=DRYOUT|3=EIB OFF|4=OFF|5=ON|6=STARTUP|7=TEST","Node 2 Air Conditioner State","Node 2 Air Conditioner State. Status of the Node 2 Air Conditioner/Fan."],
        "NODE2000006":["ETHOS","N2_AC_TEMP","celcius","12","sprintf","%5.4f","Air Cooling Fluid Temp (Node 2)","Air Cooling Fluid Temp (Node 2). Temperature of the water loop cooling the air in Node 2."],
        "NODE2000007":["ETHOS","N2_AV_TEMP","celcius","12","sprintf","%5.4f","Avionics Cooling Fluid Temp (Node 2)","Avionics Cooling Fluid Temp (Node 2). Temperature of fluid cooling avionics in Node 2."],
        "NODE3000001":["ETHOS","N3_PPO2","torr","12","sprintf","%5.4f","Node 3 ppO2","Node 3 ppO2. Oxygen level measured by Node 3 Sensors"],
        "NODE3000002":["ETHOS","N3_PPN2","torr","12","sprintf","%5.4f","Node 3 ppN2","Node 3 ppN2. Nitrogen level measured by Node 3 Sensors."],
        "NODE3000003":["ETHOS","N3_PPCO2","torr","12","sprintf","%5.4f","Node 3 ppCO2","Node 3 ppCO2. Carbon dioxide level measured by Node 3 Sensors."],
        "NODE3000004":["ETHOS","N3_URN_PROC","event","64","enum","2=STOP|4=SHUTDOWN|8=MAINTENANCE|16=NORMAL|32=STANDBY|64=IDLE|128=SYSTEM INITIALIZED","Urine Processor State","Urine Processor State. Status of the Urine Processor."],
        "NODE3000005":["ETHOS","N3_URN_TANK","kg","12","sprintf","%5.4f","Urine Tank Qty","Urine Tank Qty. Amount of urine available to be processed."],
        "NODE3000006":["ETHOS","N3_H2O_PROC","event","64","enum","1=STOP|2=SHUTDOWN|3=STANDBY|4=PROCESS|5=HOT SERVICE|6=FLUSH|7=WARM SHUTDOWN","Water Processor State","Water Processor State. Status of the Water Processor."],
        "NODE3000007":["ETHOS","N3_H2O_STEP","event","64","enum","0=NONE|1=VENT|2=HEATUP|3=PURGE|4=FLOW|5=TEST|6=TEST_SV_1|7=TEST_SV_2|8=SERVICE","Water Processor Step","Water Processor Step. What the Water Processor is doing at this time."],
        "NODE3000008":["ETHOS","N3_WASTE","kg","12","sprintf","%5.4f","Waste Water Tank Qty","Waste Water Tank Qty. Amount of waste water waiting to be processed."],
        "NODE3000009":["ETHOS","N3_CLEAN","kg","12","sprintf","%5.4f","Clean Water Tank Qty","Clean Water Tank Qty. Amount of potable water available."],
        "NODE3000010":["ETHOS","N3_O2_GEN","event","64","enum","1=PROCESS|2=STANDBY|3=SHUTDOWN|4=STOP|5=VENT_DOME|6=INERT_DOME|7=FAST_SHUTDOWN|8=N2_PURGE_SHUTDOWN","Oxygen Generator State","Oxygen Generator State. Status of the Oxygen Generator."],
        "NODE3000011":["ETHOS","N3_O2_PROD","event","64","enum","327.67","O2 Production rate","O2 Production rate. Amount of oxygen being produced if the Oxygen Generator status is"],
        "NODE3000012":["ETHOS","N3_AV_TEMP","celcius","12","sprintf","%5.4f","Avionics Cooling Fluid Temp (Node 3)","Avionics Cooling Fluid Temp (Node 3). Temperature of fluid cooling avionics in the Lab."],
        "NODE3000013":["ETHOS","N3_AC_TEMP","celcius","12","sprintf","%5.4f","Air Cooling Fluid Temp (Node 3)","Air Cooling Fluid Temp (Node 3). Temperature of the water loop cooling the air in Node 3."],
        "NODE3000017":["ETHOS","N3_MTL","kg","12","sprintf","%5.4f","Coolant water quantity (Node 3)","Coolant water quantity (Node 3). N3 Moderate Temperature Loop (MTL) water level"],
        "NODE3000018":["ETHOS","N3_AC","event","64","enum","0=RESET|1=DRAIN|2=DRYOUT|3=EIB OFF|4=OFF|5=ON|6=STARTUP|7=TEST","Node 3 Air Conditioner State","Node 3 Air Conditioner State. Status of the Node 3 Air Conditioner/Fan."],
        "NODE3000019":["ETHOS","N3_LTL","kg","12","sprintf","%5.4f","Coolant water quantity (Node 3)","Coolant water quantity (Node 3). N3 Low Temperature Loop (LTL) water level."],
        "AIRLOCK000049":["ETHOS","ARL_PRES_CREW","torr","12","sprintf","%5.4f","Crewlock Pressure","Crewlock Pressure. Cabin pressure in the airlock."],
        "AIRLOCK000050":["ETHOS","ARL_HIPO2","event","64","enum","0=CLOSED|1=OPEN|2=IN-TRANSIT|3=FAILED","Hi P O2 Supply valve position","Hi P O2 Supply valve position. Position of the valve controlling the ISS oxygen supply for EVA."],
        "AIRLOCK000051":["ETHOS","ARL_LOPO2","event","64","enum","0=CLOSED|1=OPEN|2=IN-TRANSIT|3=FAILED","Lo P O2 Supply Valve position","Lo P O2 Supply Valve position. Position of the valve controlling the ISS oxygen supply."],
        "AIRLOCK000052":["ETHOS","ARL_N2","event","64","enum","0=CLOSED|1=OPEN|2=IN-TRANSIT|3=FAILED","N2 Supply Valve position","N2 Supply Valve position. Position of the valve controlling the ISS nitrogen supply."],
        "AIRLOCK000053":["ETHOS","ARL_AC","event","64","enum","0=RESET|1=DRAIN|2=DRYOUT|3=EIB OFF|4=OFF|5=ON|6=STARTUP|7=TEST","Airlock Air Conditioner State","Airlock Air Conditioner State. Status of the Airlock Air Conditioner/Fan."],
        "AIRLOCK000054":["ETHOS","ARL_PRES_EQUIP","torr","12","sprintf","%5.4f","Airlock Pressure","Airlock Pressure. Cabin pressure in the equipment lock."],
        "AIRLOCK000055":["ETHOS","ARL_HIPO2_PRES","torr","12","sprintf","%5.4f","Airlock Hi P O2 Tank Pressure","Airlock Hi P O2 Tank Pressure. Pressure in the oxygen tank used to support EVA."],
        "AIRLOCK000056":["ETHOS","ARL_LOPO2_PRES","torr","12","sprintf","%5.4f","Airlock Lo P O2 Tank Pressure","Airlock Lo P O2 Tank Pressure. Pressure in the oxygen tanks."],
        "AIRLOCK000057":["ETHOS","ARL_N2_PRES","torr","12","sprintf","%5.4f","Airlock N2 Tank Pressure","Airlock N2 Tank Pressure. Pressure in the reserve nitrogen tanks."],
        "USLAB000053":["ETHOS","LAB_PPO2","torr","12","sprintf","%5.4f","Lab ppO2","Lab ppO2. Oxygen level measured by Lab Sensors."],
        "USLAB000054":["ETHOS","LAB_PPN2","torr","12","sprintf","%5.4f","Lab ppN2","Lab ppN2. Nitrogen level measured by Lab Sensors."],
        "USLAB000055":["ETHOS","LAB_PPCO2","torr","12","sprintf","%5.4f","Lab ppCO2","Lab ppCO2. Carbon dioxide level measured by Lab Sensors."],
        "USLAB000056":["ETHOS","LAB_LTL","kg","12","sprintf","%5.4f","Coolant water quantity, LT (Lab)","Coolant water quantity, LT (Lab). Lab Low Temperature Loop (LTL) water level"],
        "USLAB000057":["ETHOS","LAB_MTL","kg","12","sprintf","%5.4f","Coolant water quantity, MT (Lab)","Coolant water quantity, MT (Lab). Lab Moderate Temperature Loop (MTL) water level."],
        "USLAB000058":["ETHOS","LAB_PRES","torr","12","sprintf","%5.4f","Cabin pressure","Cabin pressure. Pressure in the US Lab."],
        "USLAB000059":["ETHOS","LAB_TEMP","celcius","12","sprintf","%5.4f","Cabin temperature","Cabin temperature. Air Temperature in the US Lab."],
        "USLAB000060":["ETHOS","LAB_AV_TEMP","celcius","12","sprintf","%5.4f","Avionics Cooling Fluid Temp (Lab)","Avionics Cooling Fluid Temp (Lab). Temperature of the water loop cooling the avionics in the Lab."],
        "USLAB000061":["ETHOS","LAB_AC_TEMP","celcius","12","sprintf","%5.4f","Air Cooling Fluid Temp (Lab)","Air Cooling Fluid Temp (Lab). Temperature of the water loop cooling the air in the Lab."],
        "USLAB000062":["ETHOS","LAB_VAC_RS","position","12","sprintf","%5.4f","Vacuum Resource System Valve Position","Vacuum Resource System Valve Position. Position of the Vacuum Resource System s overboard vent valve."],
        "USLAB000063":["ETHOS","LAB_VAC_EX","position","12","sprintf","%5.4f","Vacuum Exhaust System Valve Position","Vacuum Exhaust System Valve Position. Position of the Vacuum Exhaust System s overboard vent valve."],
        "USLAB000064":["ETHOS","LAB_AC_P","event","64","enum","0=RESET|1=DRAIN|2=DRYOUT|3=EIB OFF|4=OFF|5=ON|6=STARTUP|7=TEST","Lab Port Air Conditioner State","Lab Port Air Conditioner State. Status of the Lab s Port Air Coditioner/Fan."],
        "USLAB000065":["ETHOS","LAB_AC_S","event","64","enum","0=RESET|1=DRAIN|2=DRYOUT|3=EIB OFF|4=OFF|5=ON|6=STARTUP|7=TEST","Lab Starboard Air Conditioner State","Lab Starboard Air Conditioner State. Status of the Lab s Starboard Air Coditioner/Fan."],
    };

};


var nodeset =
    ["NODE2000001",
        "NODE2000002",
        "NODE2000003",
        "NODE2000006",
        "NODE2000007",
        "NODE3000001",
        "NODE3000002",
        "NODE3000003",
        "NODE3000004",
        "NODE3000005",
        "NODE3000006",
        "NODE3000007",
        "NODE3000008",
        "NODE3000009",
        "NODE3000010",
        "NODE3000011",
        "NODE3000012",
        "NODE3000013",
        "NODE3000017",
        "NODE3000018",
        "NODE3000019",
        "AIRLOCK000049",
        "AIRLOCK000050",
        "AIRLOCK000051",
        "AIRLOCK000052",
        "AIRLOCK000053",
        "AIRLOCK000054",
        "AIRLOCK000055",
        "AIRLOCK000056",
        "AIRLOCK000057",
        "USLAB000053",
        "USLAB000054",
        "USLAB000055",
        "USLAB000056",
        "USLAB000057",
        "USLAB000058",
        "USLAB000059",
        "USLAB000060",
        "USLAB000061",
        "USLAB000062",
        "USLAB000063",
        "USLAB000064",
        "USLAB000065"];