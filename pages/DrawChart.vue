<template>
<!--  <div>hello</div>-->
  <div>
    <b style="margin-left: 20px">{{yName}}</b>
    <line-chart v-if="loaded" :chartdata="chartdata" :options="options"/>
    <hr>
  </div>
</template>

<script>
  import LineChart from "./LineChart";

  export default {
    name: "DrawChart",
    components: {LineChart},
    props:{
      dateArr: Array,
      yArr: Array,
      yName: String,
      yMin: String,
      yMax: String,
      unit: String,
    },
    data: () => ({
      loaded: false,
      chartdata: null,
      options: null
    }),
    created: function () {
      let minArr = [];
      let maxArr = [];
      for(let num in this.dateArr){
        minArr.push(this.yMin);
        maxArr.push(this.yMax);
      }
      this.chartdata = {
        labels: this.dateArr,
        datasets: [
          {
            label: this.yName,
            borderColor: "green",
            pointBorderColor: '#249EBF',
            pointBorderWidth: 5,
            fill: false,
            //Data to be represented on y-axis
            data: this.yArr
          },
          {
            label: 'Min',
            borderDash: [10, 10],
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 0,
            pointRadius: 0,
            pointHitRadius: 0,
            borderColor: "blue",
            fill: false,
            //Data to be represented on y-axis
            data: minArr
          },
          {
            label: 'Max',
            borderDash: [10, 10],
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 0,
            pointRadius: 0,
            pointHitRadius: 0,
            borderColor: "red",
            fill: false,
            //Data to be represented on y-axis
            data: maxArr
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
              labelString: this.unit,
              fontColor: "green"
            }
          }]
        }
      }
      this.loaded = true;
    },
  }
</script>

<style scoped>

</style>
