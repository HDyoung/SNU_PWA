<template>
  <div class="main">
    <v-container>얼릉 회복합시다 </v-container>
    <v-app v-if="loading">
      <v-main>
        <v-container><div><b>마지막 검사일: {{year}}-{{month}}-{{day}}</b></div></v-container>
<!--        <button @click="$store.commit('increment')">{{ $store.state.token }}</button>-->
        <v-col cols="12">
          <v-autocomplete
            v-model="selectedLiver"
            :items="liverItems"
            outlined
            dense
            chips
            small-chips
            label="간 수치"
            multiple
          ></v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-autocomplete
            v-model="selectedNotLiver"
            :items="notliverItems"
            outlined
            dense
            chips
            small-chips
            label="모든 수치"
            multiple
          ></v-autocomplete>
        </v-col>
        <div class="my-2">
          <v-btn class="ma-2" outlined color="indigo" v-on:click="apply">Apply</v-btn>
          <v-btn class="ma-2" outlined color="teal" v-on:click="clear">Clear</v-btn>
          <v-btn class="ma-2" outlined color="blue-grey" v-on:click="clickLiver">간 수치</v-btn>
          <v-btn class="ma-2" outlined color="blue-grey" v-on:click="clickNotLiver">모든 수치</v-btn>
        </div>
        <div>
          <draw-chart v-for="item in selectedCodeToBlood" :dateArr ="item.xArr" :yArr="item.yArr" :yName="item.yName" :yMin="item.yMin" :yMax="item.yMax" :unit="item.unit" :range="item.range"></draw-chart>
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
        </div>
      </v-main>
    </v-app>
    <v-app v-else>
      <img src="../static/Spin-1s-200px.svg" alt="My Awesome SVG">
    </v-app>
  </div>
</template>

<script>
  import LineChart from '@/pages/LineChart'
  import DrawChart from '@/pages/DrawChart'
  import { mapGetters, mapActions } from 'vuex'
  import qs from "querystring";
  import axios from "axios";


  export default {
    name: 'VueChartJS',
    components: {
      LineChart,
      DrawChart
    },
    data: () => ({
      loading: false,
      selectedLiver: [],
      selectedNotLiver: [],
      notliverItems: [],
      year: null,
      month: null,
      day: null,
      values:[],
      liverItems: ["AST(GOT) (아스파르데이트아미노전달효소)","ALT(GPT) (알라닌아미노전달효소)", "GGT (감마글루타밀전달효소)", "T. Bil. (총빌리루빈)", "D. Bil. (직접빌리루빈)","Alk. phos. (알카린포스파타제)" ],
      liverCode: {"AST(GOT) (아스파르데이트아미노전달효소)": undefined, "ALT(GPT) (알라닌아미노전달효소)" :undefined, "GGT (감마글루타밀전달효소)" :undefined, "T. Bil. (총빌리루빈)":undefined, "D. Bil. (직접빌리루빈)" :undefined, "Alk. phos. (알카린포스파타제)":undefined},
      codeToBlood: {},
      selectedCodeToBlood: [],
      dateArr: [],
      yArr: [],
      yName: null,
      yMin: 0,
      yMax: 0,
      unit: null,
      token: "",
    }),
    created: function () {
      // this.$store.dispatch('getData', 'dfdfdfdf')
      // this.$store.dispatch('getToken').then(()  =>{
      //   console.log("data: "+this.$store.getters['token'])
      //   this.$store.dispatch('getData', this.$store.getters['token'])
      // });

      let now = new Date();
      // this.year = now.getFullYear();
      // this.month = now.getMonth()+1;
      // this.day = now.getDate();
      this.$vuetify.theme.dark = false;
      this.fetch();

    },
    methods: {
      fetch: function () {
        this.$axios.$get('/inspire/fetch/',null)
            .then((result) => {
              console.log(result.responseData)
              let map = {}
              for(let ele in result.responseData){
                let item = result.responseData[ele][0];
                if(!(ele in map)){
                  map[ele] = {};
                }
                let subMap = map[ele];
                subMap.yName = item.orderNm;
                subMap.yMin = item.referenceMinVal;
                subMap.yMax = item.referenceMaxVal;
                subMap.unit = item.unit;
                subMap.range = item.referenceVal;
                subMap.time = {};

                let arr = result.responseData[ele];
                for(let i=0; i<arr.length; i++){
                  let val = Number(arr[i].orderResultVal);
                  let date = new Date(arr[i].examDt).getTime();
                  subMap.time[date] = val;
                }
              }
              console.log(map)

              //remove good elements
              for(var code in map){
                var item = map[code];
                var dateArr = Object.keys(item.time).sort();
                var lastVal = item.time[dateArr[dateArr.length-1]];

                let xArr = [];
                let yArr = [];
                for(let i=0; i<dateArr.length; i++){
                  let d = new Date(Number(dateArr[i]));
                  this.year = d.getFullYear();
                  this.month = d.getMonth()+1;
                  this.day = d.getDate();
                  let x = (d.getMonth()+1)+'-'+d.getDate()

                  let v = item.time[dateArr[i]]
                  yArr.push(v);
                  xArr.push(x);
                }
                item.yArr = yArr;
                item.xArr = xArr;
                item.dateArr = dateArr;
                this.codeToBlood[code] = item;
              }

              //init notliverItems
              let keys = Object.keys(this.codeToBlood).sort(function (a,b) {
                let aLast = map[a].dateArr[map[a].dateArr.length-1];
                let bLast = map[b].dateArr[map[b].dateArr.length-1];
                if(bLast != aLast){
                  return bLast - aLast
                }
                let aLastVal = map[a].yArr[map[a].yArr.length-1];
                let bLastVal = map[b].yArr[map[b].yArr.length-1];

                let avga = (map[a].yMax + map[a].yMin)/2;
                let avgb = (map[b].yMax + map[b].yMin)/2;
                let diffa = 0;
                let diffb = 0;
                if(aLastVal > map[a].yMax){
                  diffa = aLastVal -  map[a].yMax;
                }else if(aLastVal < map[a].yMin){
                  diffa = map[a].yMin- aLastVal;
                }
                if(bLastVal > map[b].yMax){
                  diffb = bLastVal -  map[b].yMax;
                }else if(bLastVal < map[b].yMin){
                  diffb = map[b].yMin- bLastVal;
                }
                return diffb/(map[b].yMax- map[b].yMin) - diffa/(map[a].yMax- map[a].yMin);
              });
              for(let idx in keys){
                let name = keys[idx];
                if(name in this.liverCode || name == "eGFR(MDRD) (사구체 여과율 (IDMS MDRD))") continue;
                this.notliverItems.push(name)
                this.selectedNotLiver.push(name)
              }
              //init
              for(let live in this.liverCode){
                this.selectedLiver.push(live)
              }
              console.log(this.codeToBlood);
              this.loading = true;
            })
            .catch((err) => {
              console.log(err)
            });
      },
      apply: function () {
        this.selectedCodeToBlood = [];
        console.log(this.codeToBlood)
        for(let i=0; i<this.selectedLiver.length; i++){
          this.selectedCodeToBlood.push(this.codeToBlood[this.selectedLiver[i]]);
        }
        for(let i=0; i<this.selectedNotLiver.length; i++){
          this.selectedCodeToBlood.push(this.codeToBlood[this.selectedNotLiver[i]]);
        }
        console.log(this.selectedCodeToBlood)
      },
      clear:function () {
        this.selectedCodeToBlood = [];
        this.selectedLiver=  [];
        this.selectedNotLiver = [];
      },
      clickLiver: function () {
        if(this.selectedLiver.length == 0){
          for(let i=0; i<this.liverItems.length; i++){
            this.selectedLiver.push(this.liverItems[i]);
          }
        }else{
          this.selectedLiver = []
        }
      },
      clickNotLiver: function () {
        if(this.selectedNotLiver.length == 0){
          for(let i=0; i<this.notliverItems.length; i++){
            this.selectedNotLiver.push(this.notliverItems[i]);
          }
        }else{
          this.selectedNotLiver = []
        }
      }
    }
  }
</script>
