import Vuex from 'vuex';
import axios from "axios";
import qs from "querystring";
const store = () => new Vuex.Store({
  state: {
    counter: 0 ,
    notliverItems: [],
    codeToBlood: {},
    token: null
  },
  getters : {
    codeToBlood(state) {
      return state.codeToBlood;
    },
    token(state) {
      return state.token;
    },
    notliverItems(state) {
      return state.notliverItems;
    }
  },
  mutations: {
    increment: (state) => { state.counter++ } ,
    setToken(state, token){
      state.token = token;
    },
    setCodeToBlood(state, data){
      state.codeToBlood = data;
    },
    setNotliverItems(state, data){
      state.notliverItems = data;
    },
  },
  actions : {
    async getToken({commit}) {
      console.log("async")
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
      try{
        const result =  await axios.post('/mobile-ui/refresh/oauth/token', qs.stringify(requestBody), config);
        console.log(result)
        commit('setToken', result.data['access_token'])
        // commit('SET_LIST',response.data);
      }catch (e) {
        console.log(e);
      }
    },
    async getData({commit}, token){
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
            let parsed = {};
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

              parsed[code] = item;
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
            commit('setCodeToBlood', parsed)

            let keys = Object.keys(this.codeToBlood);
            let notArr = [];
            for(let idx in keys){
              let name = keys[idx];
              if(name in this.liverCode) continue;
              notArr.push(name)
            }
            commit('setNotliverItems', notArr)
          })
          .catch((err) => {
            console.log(err)
          });
    }


}})
export default store
