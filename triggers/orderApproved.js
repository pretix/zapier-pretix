const subscribeHook = (z, bundle) => {
    // bundle.targetUrl has the Hook URL this app should call when something happens
    const data = {
        enabled: true,
        target_url: bundle.targetUrl,
        all_events: bundle.inputData.eventSlug ? false : true,
        limit_events: bundle.inputData.eventSlug ? [bundle.inputData.eventSlug] : [],
        action_types: ["pretix.event.order.approved"],
    };
    const options = {
        url: process.env.BASE_URL + `/api/v1/organizers/${bundle.inputData.organizerSlug}/webhooks/`,
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return z.request(options)
        .then((response) => z.JSON.parse(response.content));
};

const unsubscribeHook = (z, bundle) => {
    // bundle.subscribeData contains the parsed response JSON from the subscribe
    // request made initially.
    const hookId = bundle.subscribeData.id;

    const options = {
        url: process.env.BASE_URL + `/api/v1/organizers/${bundle.inputData.organizerSlug}/webhooks/${hookId}/`,
        method: 'DELETE',
    };
    return z.request(options)
        .then((response) => z.JSON.parse(response.content));
};

const getOrder = (z, bundle) => {
    // bundle.cleanedRequest will include the parsed JSON object (if it's not a
    // test poll) and also a .querystring property with the URL's query string.
    const responsePromise = z.request({
        url: process.env.BASE_URL + `/api/v1/organizers/${bundle.cleanedRequest.organizer}/events/${bundle.cleanedRequest.event}/orders/${bundle.cleanedRequest.code}/`,
    });
    return responsePromise
        .then(response => [z.JSON.parse(response.content)]);
};

const getFallbackRealOrder = (z, bundle) => {
    const eventSlug = bundle.inputData.eventSlug;
    if (eventSlug == null) {
        var url = process.env.BASE_URL + `/api/v1/organizers/${bundle.inputData.organizerSlug}/events/`;
        const responsePromise = z.request({
            url: url,
        });
        return responsePromise
            .then(response => {
                var events = z.JSON.parse(response.content).results;
                if (events.length === 0) {
                    return [];
                }
                bundle.inputData.eventSlug = events[0].slug;
                return getFallbackRealOrder(z, bundle);
            });
    } else {
        var url = process.env.BASE_URL + `/api/v1/organizers/${bundle.inputData.organizerSlug}/events/${bundle.inputData.eventSlug}/orders/`;
        const responsePromise = z.request({
            url: url,
            params: {
                ordering: '-datetime'
            }
        });
        return responsePromise
            .then(response => {
                var items = z.JSON.parse(response.content).results;
                items.forEach(item => {
                    item.id = eventSlug + "-" + item.code;
                });
                return items
            });
    }
};

module.exports = {
    key: 'orderApproved',

    noun: 'Order',
    display: {
        label: 'Order Approved',
        description: 'Triggers when an order is approved.'
    },

    operation: {
        inputFields: [
            {key: 'eventSlug', required: false},  // TODO: Dynamic dropdown
            {key: 'organizerSlug', required: true},  // TODO: Dynamic dropdown
        ],

        type: 'hook',

        performSubscribe: subscribeHook,
        performUnsubscribe: unsubscribeHook,

        perform: getOrder,
        performList: getFallbackRealOrder,

        // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
        // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
        // returned records, and have obviously dummy values that we can show to any user.
        sample: {
            "code": "ABC12",
            "id": "DEMOCON-ABC12",
            "status": "p",
            "secret": "k24fiuwvu8kxz3y1",
            "email": "tester@example.org",
            "locale": "en",
            "datetime": "2017-12-01T10:00:00Z",
            "expires": "2017-12-10T10:00:00Z",
            "last_modified": "2017-12-01T10:00:00Z",
            "payment_date": "2017-12-05",
            "payment_provider": "banktransfer",
            "fees": [],
            "total": "23.00",
            "comment": "",
            "checkin_attention": false,
            "require_approval": false,
            "invoice_address": {
                "last_modified": "2017-12-01T10:00:00Z",
                "company": "Sample company",
                "is_business": true,
                "name": "John Doe",
                "name_parts": {
                    "full_name": "John Doe",
                    "_scheme": "full_name"
                },
                "street": "Test street 12",
                "zipcode": "12345",
                "city": "Testington",
                "country": "Testikistan",
                "internal_reference": "",
                "vat_id": "EU123456789",
                "vat_id_validated": false
            },
            "positions": [
                {
                    "id": 23442,
                    "order": "ABC12",
                    "positionid": 1,
                    "item": 1345,
                    "variation": null,
                    "price": "23.00",
                    "attendee_name": "Peter",
                    "attendee_name_parts": {
                        "full_name": "Peter",
                        "_scheme": "full_name"
                    },
                    "attendee_email": null,
                    "voucher": null,
                    "tax_rate": "0.00",
                    "tax_rule": null,
                    "tax_value": "0.00",
                    "secret": "z3fsn8jyufm5kpk768q69gkbyr5f4h6w",
                    "addon_to": null,
                    "subevent": null,
                    "pseudonymization_id": "MQLJvANO3B",
                    "checkins": [
                        {
                            "list": 44,
                            "datetime": "2017-12-25T12:45:23Z"
                        }
                    ],
                    "answers": [
                        {
                            "question": 12,
                            "question_identifier": "WY3TP9SL",
                            "answer": "Foo",
                            "option_idenfiters": [],
                            "options": []
                        }
                    ],
                    "downloads": [
                        {
                            "output": "pdf",
                            "url": "https://pretix.eu/api/v1/organizers/bigevents/events/sampleconf/orderpositions/23442/download/pdf/"
                        }
                    ]
                }
            ],
            "downloads": [
                {
                    "output": "pdf",
                    "url": "https://pretix.eu/api/v1/organizers/bigevents/events/sampleconf/orders/ABC12/download/pdf/"
                }
            ],
            "payments": [
                {
                    "local_id": 1,
                    "state": "confirmed",
                    "amount": "23.00",
                    "created": "2017-12-01T10:00:00Z",
                    "payment_date": "2017-12-04T12:13:12Z",
                    "provider": "banktransfer"
                }
            ],
            "refunds": [
                {
                    "local_id": 1,
                    "state": "canceled",
                    "source": "admin",
                    "amount": "12.00",
                    "payment": 1,
                    "created": "2017-12-01T10:00:00Z",
                    "execution_date": "2017-12-04T12:13:12Z",
                    "provider": "banktransfer"
                }
            ]
        },

        // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
        // field definitions. The result will be used to augment the sample.
        // outputFields: () => { return []; }
        // Alternatively, a static field definition should be provided, to specify labels for the fields
        outputFields: [
            {key: 'code', label: 'Order code'},
            {key: 'status', label: 'Order status'},
            {key: 'locale', label: 'Order locale'},
            {key: 'datetime', label: 'Order date'},
            {key: 'expires', label: 'Order payment deadline'},
            {key: 'total', label: 'Order total'},
            {key: 'email', label: 'Order email'},
            {key: 'require_approval', label: 'Requires approval'},
            {key: 'invoice_address__company', label: 'Invoice address: company'},
            {key: 'invoice_address__name', label: 'Invoice address: name'},
            {key: 'invoice_address__street', label: 'Invoice address: street'},
            {key: 'invoice_address__zipcode', label: 'Invoice address: ZIP code'},
            {key: 'invoice_address__city', label: 'Invoice address: city'},
            {key: 'invoice_address__country', label: 'Invoice address: country'},
            {key: 'positions[]attendee_name', label: 'Attendee name'},
            {key: 'positions[]attendee_email', label: 'Attendee email'},
            {key: 'positions[]voucher', label: 'Voucher'},
            {key: 'positions[]secret', label: 'Ticket secret'},
            {key: 'positions[]answers[]question_identifier', label: 'Question identifier'},
            {key: 'positions[]answers[]answer', label: 'Question answer'},
        ]
    }
};
