// amplify/data/resource.ts - Define the data schema

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Customer model
  Customer: a
    .model({
      name: a.string().required(),
      email: a.string().required(),
      phone: a.string().required(),
      address: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Moving Job model
  MovingJob: a
    .model({
      customerId: a.string().required(),
      currentAddress: a.string().required(),
      destinationAddress: a.string().required(),
      scheduledDate: a.date().required(),
      status: a.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
      jobSize: a.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
      specialItems: a.string(),
      estimatedCost: a.float(),
      actualCost: a.float(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});