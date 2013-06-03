describe('Sugarscape', function(){
  describe('Agent', function(){
    beforeEach(function() {
      this.agent = new Sugarscape.Agent();
    });

    it('sets initial sugar to 1', function(){
      expect(this.agent.currentSugar).to.equal(1);
    });
  });
});
