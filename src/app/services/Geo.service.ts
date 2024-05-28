import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GeoService {
    
    apiUrl = environment.noozDomain;
    geo = require('./geo.json');
    nameMap = {};
    codeMap = {};
    langMap = {};
    constructor() {
        /** Precompute name and code lookups. */
        // this.geo.forEach(this.mapCodeAndName)
        this.geo.forEach(country => {
          this.nameMap[country.name.toLowerCase()] = country.code
          this.codeMap[country.code.toLowerCase()] = country.name
          this.langMap[country.code.toLowerCase()] = country.lang
        });

    }

    mapCodeAndName (country) {
        this.nameMap[country.name.toLowerCase()] = country.code
        this.codeMap[country.code.toLowerCase()] = country.name
        this.langMap[country.lang.toLowerCase()] = country.lang
    }

    overwrite = function overwrite (countries) {
        if (!countries || !countries.length) return
        countries.forEach(function (country) {
          var foundIndex = this.geo.findIndex(function (item) {
            return item.code === country.code
          })
          this.geo[foundIndex] = country
          this.mapCodeAndName(country)
        })
      }

      getCode = function getCode (name) {
        return this.nameMap[name.toLowerCase()]
      }
      
      getName = function getName (code) {
        var countryName = this.codeMap[code.toLowerCase()];
        try {
          if (countryName) {
            var split = countryName.split(' ');
            if (split.length>4) {
              return code
            }
          }
        }
        catch(err) {
          console.log(countryName, code)
        }
        return countryName;
      }
      
      getNames = function getNames () {
        return this.geo.map(function (country) {
          return country.name
        })
      }
      
      getCodes = function getCodes () {
        return this.geo.map(function (country) {
          return country.code
        })
      }
      
      getCodeList = function getCodeList () {
        return this.codeMap
      }
      
      getNameList = function getNameList () {
        return this.nameMap
      }
      
      getData = function getData () {
        return this.geo;
      }

      getLangList = function getLangList () {
        return this.langMap
      }

      getLang = function getLang (code) {
        return this.langMap[code.toLowerCase()]
      }

      getLangs = function getLangs () {
        return this.geo.map(function (country) {
          return country.lang
        })
      }
}
