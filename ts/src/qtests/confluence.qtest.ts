describe('Tests Confluence Actions', () => {
  let connection: string;
  beforeAll(() => {
    const username = process.env.CONFLUENCE_USERNAME;
    const password = process.env.CONFLUENCE_PASSWORD;
    const cloudId = process.env.CONFLUENCE_CLOUD_ID;
    if (!username || !password || !cloudId) {
      throw new Error('Missing required environment variables for Confluence tests');
    }
    connection = testApi.createConnection('confluence', {
      opts: {
        username: username!,
        password: password!,
        cloud_id: cloudId!,
        swagger_base_path: `/ex/confluence/${cloudId}/wiki/api/v2`,
        oauth2_grant_type: 'none',
        ping_path: '',
      } as any,
    });
    expect(connection).toBeDefined();
  });

  // const base_context = {
  //   conn_opts: {
  //     token: process.env.CONFLUENCE_TOKEN,
  //     cloud_id: process.env.CONFLUENCE_CLOUD_ID,
  //   } as any,
  // };

  // describe('Should test Confluence allowed values', () => {
  //   it('Should get blogpost allowed values', async () => {
  //     const allowed_values = await getConfluenceBlogpostIdAllowedValues(base_context);
  //     expect(allowed_values).toBeDefined();
  //     expect(allowed_values.length).toBeGreaterThan(0);
  //   });
  //   it('Should get task allowed values', async () => {
  //     const allowed_values = await getConfluenceTaskIdAllowedValues(base_context);
  //     expect(allowed_values).toBeDefined();
  //     expect(allowed_values.length).toBeGreaterThan(0);
  //   });
  //   it('Should get space allowed values', async () => {
  //     const allowed_values = await getConfluenceSpaceIdAllowedValues(base_context);
  //     expect(allowed_values).toBeDefined();
  //     expect(allowed_values.length).toBeGreaterThan(0);
  //   });
  //   it('Should get page allowed values', async () => {
  //     const allowed_values = await getConfluencePageIdAllowedValues(base_context);
  //     expect(allowed_values).toBeDefined();
  //     expect(allowed_values.length).toBeGreaterThan(0);
  //   });
  //   it('Should get label allowed values', async () => {
  //     const allowed_values = await getConfluencePageIdAllowedValues(base_context);
  //     expect(allowed_values).toBeDefined();
  //     expect(allowed_values.length).toBeGreaterThan(0);
  //   });
  // });

  describe('Should test Confluence actions', () => {
    let createdBlogpostId: string | undefined;
    let spaceId: string | undefined;
    let createdPageId: string | undefined;
    let taskId: string | undefined;

    it('Should get spaces', async () => {
      const response = await testApi.execAppAction('confluence', 'getSpaces', connection, {});

      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);

      spaceId = response.results[0].id;
    });

    it('Should get space by id', async () => {
      expect(spaceId).toBeDefined();

      const { body } = await testApi.execAppAction('confluence', 'getSpaceById', connection, {
        id: spaceId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBe(spaceId);
    });

    it('Should create a blogpost', async () => {
      const { body } = await testApi.execAppAction('confluence', 'createBlogPost', connection, {
        spaceId,
        title: 'Test Blog Post',
      });

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      createdBlogpostId = body.id;
    });

    it('Should get Blog post by id', async () => {
      expect(createdBlogpostId).toBeDefined();

      const { body } = await testApi.execAppAction('confluence', 'getBlogPostById', connection, {
        id: createdBlogpostId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBe(createdBlogpostId);
    });

    it('Should list blog posts', async () => {
      const response = await testApi.execAppAction('confluence', 'getBlogPosts', connection, {});

      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
    });

    it('Should delete blog post', async () => {
      expect(createdBlogpostId).toBeDefined();

      const response = await testApi.execAppAction('confluence', 'deleteBlogPost', connection, {
        id: createdBlogpostId,
      });

      expect(response).toBeDefined();
    });

    it('Should create a page', async () => {
      const { body } = await testApi.execAppAction('confluence', 'createPage', connection, {
        title: 'Test Page',
        spaceId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBeDefined();

      createdPageId = body.id;
    });

    it('Should get page by id', async () => {
      expect(createdPageId).toBeDefined();

      const { body } = await testApi.execAppAction('confluence', 'getPageById', connection, {
        id: createdPageId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBe(createdPageId);
    });

    it('Should update page title', async () => {
      expect(createdPageId).toBeDefined();

      const response = await testApi.execAppAction('confluence', 'updatePageTitle', connection, {
        id: createdPageId,
        status: 'current',
        title: 'Updated Test Page',
      });

      expect(response).toBeDefined();
    });

    it('Should list pages in space', async () => {
      expect(spaceId).toBeDefined();

      const response = await testApi.execAppAction('confluence', 'getPagesInSpace', connection, {
        id: spaceId,
      });

      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
    });

    it('Should delete page', async () => {
      expect(createdPageId).toBeDefined();

      const response = await testApi.execAppAction('confluence', 'deletePage', connection, {
        id: createdPageId,
      });

      expect(response).toBeDefined();
    });

    it('Should get tasks', async () => {
      const response = await testApi.execAppAction('confluence', 'getTasks', connection, {});

      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);

      taskId = response.results[0].id;
    });

    it('Should get task by id', async () => {
      expect(taskId).toBeDefined();

      const { body } = await testApi.execAppAction('confluence', 'getTaskById', connection, {
        id: taskId,
      });

      expect(body).toBeDefined();
      expect(body.id).toBe(taskId);
    });

    it('Should update task', async () => {
      expect(taskId).toBeDefined();

      const response = await testApi.execAppAction('confluence', 'updateTask', connection, {
        id: taskId,
        status: 'complete',
      });

      expect(response).toBeDefined();
    });
  });
});
