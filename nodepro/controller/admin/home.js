/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class home extends auth {
    constructor(base) {
        super(base);
    }
    index() {
        return this.viewer.view('dashboard/index');
    }
}
module.exports = home;