
function main() {
    var service = new SmartWateringDataService();
    var mainModel = new MainModel(service);
    var mainController = new MainController(mainModel);
    mainController.start();
}
