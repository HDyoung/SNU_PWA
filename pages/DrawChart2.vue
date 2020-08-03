<template>
<!--  <div>hello</div>-->
  <line-chart v-if="loaded" :chartdata="chartdata" :options="options"/>
</template>

<script>
  import qs from 'querystring'
  import LineChart from "./LineChart";

  export default {
    name: "DrawChart",
    components: {LineChart},
    data: () => ({
      loaded: false,
      token: "",
      //L3015
      gpt:{},
      chartdata: null,
      options: null
    }),
    created: function () {
      console.log("heLL");
      this.login();
    },
    methods: {
      login: function () {
        const requestBody = {
          grant_type: 'password',
          username: 'D2HxiPOin1MiIJ7mRo3Z3mJ7BJV7wVKE0gB53eV/qRFtloMqCRc5CAnbRcxE2L8qQl5rcTMzUUhmE8Qi52b0PlmHbpcPmsfK0uK9QVwrPruE/ePoXXWCYfFD39D0/Z+mjWFDQhqzjWBcS/AsWc7Yy6DlH1Afe1/jn528mCbUqk4=',
          password: 'NKA4a7DjjkJ6CqL1MjoZLTYJuIyhouJHZG8YXAYcIVPuSeFysIgDbCMkLsLPwaDteOEEMFAMRZT6lH3yQfkuhHAgUIkd7EnHtysFRPFRkTz+gjcBXG7cjew7BBtomO7L13fUe5CW5XGrW9mSJspNIBd3iwUe7YJ0q2BHjX5DiEg=',
          client_id: 'MCARE',
          hospitalCd: 11100079
        }

        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        this.$axios.$post('/mobile-ui/refresh/oauth/token', qs.stringify(requestBody), config)
            .then((result) => {
              this.token = result['access_token'];
              this.getResult()
            })
            .catch((err) => {
              console.log(err)
            });
      },
      getResult: function(){
        const config = {
          headers: {
            'Authorization': 'Bearer '+this.token
          }
        }

        this.$axios.$get('mobile-ui/user/api/labResult/v1/11100079/4D327846374871776C5434693072324D65444E7854413D3D?startDt=20200723&endDt=20200803',config)
            .then((result) => {
              var map = {}
              for(var num in result.body){
                var item = result.body[num];

                if(item.orderCd == 'L3015'){
                  map[item.examDt] = item.orderResultVal;
                }
              }
              console.log(map)
              this.gpt = map;
              console.log(this.gpt)
              this.chartdata = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                datasets: [
                  {
                    label: 'APT',
                    borderColor: "#eebcde",
                    pointBorderColor: '#249EBF',
                    fill: false,
                    //Data to be represented on y-axis
                    data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100]
                  },
                  {
                    label: 'APTㅇㅇㅇ',
                    borderColor: "#eebcde",
                    pointBorderColor: '#249EBF',
                    fill: false,
                    //Data to be represented on y-axis
                    data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                  }]}
              this.options={
                scales: {
                  xAxes: [{
                    gridLines: {
                      display: true,
                      color: "black",
                      borderDash: [2, 5],
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "Date",
                      fontColor: "red"
                    }
                  }],
                  yAxes: [{
                    ticks: {
                      min: 0,
                      // max: 100,
                      // stepSize: 20
                    },
                    gridLines: {
                      display: false,
                      color: "black",
                      borderDash: [2, 5],
                    },
                    scaleLabel: {
                      display: true,
                      labelString: "IU/L",
                      fontColor: "green"
                    }
                  }]
                }
              }
              this.loaded = true;
            })
            .catch((err) => {
              console.log(err)
            });
      },
    }
  }
</script>

<style scoped>

</style>
