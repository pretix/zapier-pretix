// triggers on test with a certain tag
const triggerTest = (z, bundle) => {
  const responsePromise = z.request({
    url: 'https://jsonplaceholder.typicode.com/posts',
    params: {
      tag: bundle.inputData.tagName
    }
  });
  return responsePromise
    .then(response => z.JSON.parse(response.content));
};

module.exports = {
  key: 'test',
  noun: 'Test',

  display: {
    label: 'Get Test',
    description: 'Triggers on a new test.'
  },

  operation: {
    inputFields: [
      
    ],
    perform: triggerTest,

    sample: {
      id: 1,
      name: 'Test'
    },

    outputFields: [
      {key: 'id', label: 'ID'},
      {key: 'name', label: 'Name'}
    ]
  }
};
