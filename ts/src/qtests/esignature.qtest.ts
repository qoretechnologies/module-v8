import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ESIGNATURE_ACTIONS } from '../apps/esignature/constants';
import _sodium from 'libsodium-wrappers';

let connection: string;

describe('Tests eSignature Actions', () => {
  let accountId: string;
  let brandId: string;
  let envelopeId: string;
  // let templateId: string;
  const documentId = Math.floor(Math.random() * 100) + 1;
  const recipientId = Math.floor(Math.random() * 100) + 1;

  beforeAll(async () => {
    const refreshToken = process.env.DOCUSIGN_REFRESH_TOKEN;
    const clientId = process.env.DOCUSIGN_CLIENT_ID;
    const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;

    const { data: refreshTokenData } = await QorusRequest.post<any>(
      {
        params: {
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        path: '/oauth/token',
      },
      { url: 'https://account-d.docusign.com', endpointId: 'Docusign' }
    );

    const accessToken = refreshTokenData?.access_token;
    const newRefreshToken = refreshTokenData?.refresh_token;

    await updateDocusignSecret(newRefreshToken);

    const { data: userInfo } = await QorusRequest.get<any>(
      {
        path: '/oauth/userinfo',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        url: 'https://account-d.docusign.com',
        endpointId: 'Docusign',
      }
    );

    const base_uri = userInfo.accounts[0].base_uri.split('//')[1];
    accountId = userInfo.accounts[0].account_id;
    connection = testApi.createConnection('docusignesignature', {
      opts: {
        token: accessToken,
        base_uri,
        account_id: accountId,
      },
    });
  });

  it('Should create a new brand', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Brands_PostBrands');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      body: {
        brandName: 'TestBrand',
      },
    });
    expect(body).toBeDefined();
    expect(body.brands).toBeDefined();
    expect(body.brands.length).toBeGreaterThan(0);
    brandId = body.brands[0].brandId;
  });

  it('Should list all brands', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Brands_GetBrands');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection);
    expect(body).toBeDefined();
  });

  it('Should delete a brand', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Brands_DeleteBrands');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      body: {
        brands: [{ brandId }],
      },
    });
    expect(body).toBeDefined();
  });

  it('Should create an envelope', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Envelopes_PostEnvelopes');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      body: {
        documents: [
          {
            documentBase64: 'dGVzdCBkb2N1c2lnbmF0dXJl',
            documentId: '1',
            fileExtension: 'txt',
            name: 'NDA.txt',
          },
        ],
        emailSubject: 'Please sign the NDA',
        status: 'created',
        sender: {
          userName: 'test',
        },
      },
    });

    expect(body).toBeDefined();
    expect(body.status).toBe('created');
    envelopeId = body.envelopeId;
  });

  it('Should list all Envelopes', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Envelopes_GetEnvelopes');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      query: {
        from_date: new Date().toISOString(),
      },
    });
    expect(body).toBeDefined();
  });

  it('Should update an envelope', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Envelopes_PutEnvelope');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
      body: {
        emailSubject: 'Updated subject',
        sender: {
          userName: 'test',
        },
      },
    });
    expect(body).toBeDefined();
  });

  it('Should get an envelope', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Envelopes_GetEnvelope');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
    });

    expect(body).toBeDefined();
    expect(body.envelopeId).toBe(envelopeId);
  });

  it('Should put documents in an envelope', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Documents_PutDocuments');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
      body: {
        documents: [
          {
            documentBase64: 'dGVzdCBkb2N1c2lnbmF0dXJl',
            documentId,
            fileExtension: 'txt',
            name: 'test.txt',
          },
        ],
        sender: {
          userName: 'test',
        },
      },
    });

    expect(body).toBeDefined();
  });

  /**
   * Returns an actual document file, which is not possible to test properly
   */
  // it('Should get the document', async () => {
  //   const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Documents_GetDocument');

  //   expect(action).toBeDefined();
  //   const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
  //     envelopeId,
  //     documentId,
  //   });
  //   expect(body).toBeDefined();
  // });

  it('Should delete documents from an envelope', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Documents_DeleteDocuments');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
      body: {
        documents: [{ documentId }],
        sender: {
          userName: 'test',
        },
      },
    });

    expect(body).toBeDefined();
  });

  it('Should list all documents', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Documents_GetDocuments');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
    });
    expect(body).toBeDefined();
    expect(body.envelopeDocuments).toBeDefined();
    expect(body.envelopeDocuments.length).toBeGreaterThan(0);
  });

  it('Should create a new recipient', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Recipients_PostRecipients');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
      body: {
        signers: [
          {
            name: 'First Test',
            recipientId,
          },
        ],
      },
    });

    expect(body).toBeDefined();
    expect(body.signers).toBeDefined();
    expect(body.signers.length).toBeGreaterThan(0);
  });

  it('Should update recepients', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Recipients_PutRecipients');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
      body: {
        signers: [
          {
            name: 'Test',
            recipientId: '2',
          },
        ],
      },
    });

    expect(body).toBeDefined();
    expect(body.recipientUpdateResults).toBeDefined();
    expect(body.recipientUpdateResults.length).toBeGreaterThan(0);
  });

  it('Should delete recipients', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Recipients_DeleteRecipients');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
      body: {
        signers: [{ recipientId }],
      },
    });

    expect(body).toBeDefined();
  });

  it('Should list all recipients', async () => {
    const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Recipients_GetRecipients');

    expect(action).toBeDefined();
    const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
      envelopeId,
    });
    expect(body).toBeDefined();
    expect(body.signers).toBeDefined();
    expect(body.signers.length).toBeGreaterThan(0);
  });

  /**
   * Template actions temporary removed
   */

  //   it('Should create a new template', async () => {
  //     const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Templates_PostTemplates');
  //     expect(action).toBeDefined();
  //     const userData = {
  //       userName: 'test',
  //     };
  //     const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
  //       body: {
  //         envelopeTemplateDefinition: {
  //           templateId: Date.now().toString(),
  //           name: 'Test template',
  //           description: 'Test description',
  //         },
  //         lastModifiedBy: userData,
  //         owner: userData,
  //         sender: userData,
  //       },
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.templateId).toBeDefined();
  //     templateId = body.templateId;
  //   });

  //   it('Should update a template', async () => {
  //     const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Templates_PutTemplate');
  //     expect(action).toBeDefined();
  //     const userData = {
  //       userName: 'test',
  //     };
  //     const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
  //       templateId,
  //       body: {
  //         envelopeTemplateDefinition: {
  //           templateId,
  //           name: 'Updated template',
  //           description: 'Updated description',
  //         },
  //         lastModifiedBy: userData,
  //         owner: userData,
  //         sender: userData,
  //       },
  //     });

  //     expect(body).toBeDefined();
  //   });

  //   it('Should get a template', async () => {
  //     const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Templates_GetTemplate');

  //     expect(action).toBeDefined();
  //     const { body } = await testApi.execAppAction('docusignesignature', action.action, connection, {
  //       templateId,
  //     });

  //     expect(body).toBeDefined();
  //     expect(body.templateId).toBe(templateId);
  //   });

  //   it('Should list all templates', async () => {
  //     const action = ESIGNATURE_ACTIONS.find((a) => a.action === 'Templates_GetTemplates');

  //     expect(action).toBeDefined();
  //     const { body } = await testApi.execAppAction('docusignesignature', action.action, connection);
  //     expect(body).toBeDefined();
  //   });
});

const updateDocusignSecret = async (newRefreshToken: string): Promise<void> => {
  const docusignSecretName = process.env.GH_MODULE_DOCUSIGN_SECRET_NAME;
  const ghModuleRepoName = process.env.GH_MODULE_REPO_NAME;
  const ghModuleRepoOwner = process.env.GH_MODULE_REPO_OWNER;
  const ghPatForSecrets = process.env.GH_PAT_FOR_SECRETS;

  const gitHubConnection = testApi.createConnection('github', {
    opts: {
      token: ghPatForSecrets,
    },
  });

  const { body } = await testApi.execAppAction(
    'github',
    'actions-get-repo-public-key',
    gitHubConnection,
    {
      repo: ghModuleRepoName,
      owner: ghModuleRepoOwner,
    }
  );

  const encryptedRefreshToken = await encryptSecret(newRefreshToken, body.key);
  await testApi.execAppAction('github', 'actions-create-or-update-repo-secret', gitHubConnection, {
    owner: ghModuleRepoOwner,
    repo: ghModuleRepoName,
    secret_name: docusignSecretName,
    body: {
      encrypted_value: encryptedRefreshToken,
      key_id: body.key_id,
    },
  });
};

const encryptSecret = async (secret: string, publicKey: string): Promise<string> => {
  const publicKeyBinary = Buffer.from(publicKey, 'base64');
  const encryptedMessage = await _sodium.crypto_box_seal(Buffer.from(secret), publicKeyBinary);

  return Buffer.from(encryptedMessage).toString('base64');
};
