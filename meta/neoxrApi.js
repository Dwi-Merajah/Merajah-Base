module.exports = class NeoxrApi {
   constructor(url = '', apiKey = '') {
      this.baseUrl = url;
      this.apiKey = apiKey;
   }

   async neoxr(api, options = {}) {
      if (!api) throw new Error("API endpoint tidak boleh kosong");
      const query = new URLSearchParams({ ...options, apikey: this.apiKey }).toString();
      const url = `${this.baseUrl}${api}?${query}`;
      let json = await Func.fetchJson(url);
      if (json?.creator) {
         json.creator = "© Merajah/Baileys";
      }
      return json;
   }
};