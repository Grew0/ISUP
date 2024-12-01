const { DATEFORMAT, DATEFORMAT_2 } = require("../../views/helpers/pretty_date");


describe("Pretty dates", function () {
    let date = new Date(2022, 10, 21, 15, 16, 17, 18);
    it("DATEFORMAT", () => {
        if(DATEFORMAT(date) !== "21.11.2022, 15:16")
            throw new Error(DATEFORMAT(date) + "");
        else return "ok";
    });




    it("DATEFORMAT_2", () => {
        if(DATEFORMAT_2(date) !== "2022-11-21T15:16")
            throw new Error(DATEFORMAT_2(date) + "");
        else return "ok";
    });

});


