SmartWateringException = function (message, reason) {
    if (typeof message !== "undefined") {
        this.message = message;
    }else{
        this.message = "";
    }
    if (typeof reason !== "undefined") {
        this.reason = reason;
    }else{
        this.reason = null;
    }
};

SmartWateringException.prototype ={
    getReason: function () {
        return this.reason;
    },
    getMessage: function () {
        return this.message;
    }
};