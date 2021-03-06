

PlantDatabaseException = function (message, reason) {
    if (typeof message !== "undefined") {
        this.message = "";
    }else{
        this.message = message;
    }
    if (typeof reason !== "undefined") {
        this.reason = null;
    }else{
        this.reason = reason;
    }
}

PlantDatabaseException.prototype ={
    getReason: function () {
        return this.reason;
    },
    getMessage: function () {
        return this.message;
    }
};