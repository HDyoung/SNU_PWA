<template>
  <div class="main">
    <v-app v-if="loading">
      <v-main>
        <v-container>얼릉 회복합시다 {{year}}-{{month}}-{{day}}</v-container>
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
            label="비 정상 수치"
            multiple
          ></v-autocomplete>
        </v-col>
        <div class="my-2">
          <v-btn class="ma-2" outlined color="indigo" v-on:click="apply">Apply</v-btn>
          <v-btn class="ma-2" outlined color="teal" v-on:click="clear">Clear</v-btn>
        </div>
        <div>
          <draw-chart v-for="item in selectedCodeToBlood" :dateArr ="item.xArr" :yArr="item.yArr" :yName="item.yName" :yMin="item.yMin" :yMax="item.yMax" :unit="item.unit"></draw-chart>
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
<!--          <draw-chart :dateArr ="dateArr" :yArr="yArr" :yName="yName" :yMin="yMin" :yMax="yMax" :unit="unit"></draw-chart>-->
        </div>
      </v-main>
    </v-app>
  </div>
</template>

<script>
  import LineChart from '@/pages/LineChart'
  import DrawChart from '@/pages/DrawChart'
  import qs from "querystring";


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
      let now = new Date();
      this.year = now.getFullYear();
      this.month = now.getMonth()+1;
      this.day = now.getDate();
      this.$vuetify.theme.dark = false;
      this.login();
      this.dateArr =["2020-07-02","2020-07-03","2020-07-04","2020-07-05"];
      this.yArr = [5,2,3.2,8.2,11];
      this.yName = "GGT";
      this.yMin = 0;
      this.yMax = 7;
      this.unit = "L";
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
              this.fetch()
            })
            .catch((err) => {
              console.log(err)
            });
      },
      fetch: function () {
        const config = {
          headers: {
            'Authorization': 'Bearer '+this.token
          }
        }

        let endDate = this.year
        if(this.month < 10){
          endDate += '0'
        }
        endDate += ''+this.month
        if(this.day < 10){
          endDate += '0'
          endDate += ''+this.day
        }
        this.$axios.$get('/mobile-ui/user/api/labResult/v1/11100079/4D327846374871776C5434693072324D65444E7854413D3D?startDt=20200701&endDt='+endDate,config)
            .then((result) => {
              var map = {}
              for(var num in result.body){
                var item = result.body[num];
                let code = item.orderNm;
                let min = item.referenceMinVal;
                let max = item.referenceMaxVal;
                let val = Number(item.orderResultVal);
                let name = item.orderNm;
                let unit = item.unit;
                let date = new Date(item.examDt).getTime();
                let range = item.referenceVal;

                if(isNaN(val)) {
                  continue;
                }
                if(!(code in map)){
                  map[code] = {};
                }
                let subMap = map[code];
                if(!('time' in subMap)){
                  subMap.time = {};
                }
                subMap.time[date] = val;
                if(!('yName' in subMap)){
                  subMap.yName = name +"_"+range;
                  subMap.yMin = min;
                  subMap.yMax = max;
                  subMap.unit = unit;
                  subMap.range = range;
                }
              }
              //remove good elements
              for(var code in map){
                var item = map[code];
                var dateArr = Object.keys(item.time).sort();
                var lastVal = item.time[dateArr[dateArr.length-1]];

                let xArr = [];
                let yArr = [];
                for(let i=0; i<dateArr.length; i++){
                  let d = new Date(Number(dateArr[i]));
                  let x = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()

                  let v = item.time[dateArr[i]]
                  yArr.push(v);
                  xArr.push(x);
                }
                item.yArr = yArr;
                item.xArr = xArr;
                this.codeToBlood[code] = item;
                // if(code in this.liverCode || lastVal < item.yMin || lastVal > item.yMax){
                //   let xArr = [];
                //   let yArr = [];
                //   for(let i=0; i<dateArr.length; i++){
                //     let d = new Date(Number(dateArr[i]));
                //     let x = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()
                //
                //     let v = item.time[dateArr[i]]
                //     yArr.push(v);
                //     xArr.push(x);
                //   }
                //   item.yArr = yArr;
                //   item.xArr = xArr;
                //   this.codeToBlood[code] = item;
                // }
              }

              let keys = Object.keys(this.codeToBlood);
              for(let idx in keys){
                let name = keys[idx];
                if(name in this.liverCode) continue;
                this.notliverItems.push(name)
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
      }
    }
  }
</script>
