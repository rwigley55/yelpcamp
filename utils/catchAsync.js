// func is what you pass in
// returns a new function that has func executed
// catches any errors and passes them to next()

module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
