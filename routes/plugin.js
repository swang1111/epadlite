// defines routes for templates
async function routes(fastify) {
  // GET {s}/templates
  fastify.route({
    method: 'GET',
    url: '/plugins',
    schema: {
      tags: ['plugins'],
      //   response: {
      //     200: 'templates_schema#',
      //   },
    },
    handler: fastify.getPlugins,
  });
  fastify.route({
    method: 'GET',
    url: '/pluginswithproject',
    schema: {
      tags: ['plugins'],
      //   response: {
      //     200: 'templates_schema#',
      //   },
    },
    handler: fastify.getPluginsWithProject,
  });
  fastify.route({
    method: 'PUT',
    url: '/plugins/:pluginid/projects/:projectids',
    schema: {
      tags: ['plugins'],

      //   response: {
      //     200: 'templates_schema#',
      //   },
    },
    handler: fastify.updateProjectsForPlugin,
  });

  fastify.route({
    method: 'PUT',
    url: '/plugins/:pluginid/templates/:templateids',
    schema: {
      tags: ['plugins'],

      //   response: {
      //     200: 'templates_schema#',
      //   },
    },
    handler: fastify.updateTemplatesForPlugin,
  });

  fastify.route({
    method: 'POST',
    url: '/plugins',
    schema: {
      tags: ['plugins'],

      //   response: {
      //     200: 'templates_schema#',
      //   },
    },
    handler: fastify.deletePlugin,
  });
  fastify.route({
    method: 'POST',
    url: '/plugins/addnew',
    schema: {
      tags: ['plugins'],

      //   response: {
      //     200: 'templates_schema#',
      //   },
    },
    handler: fastify.savePlugin,
  });
  /*
    fastify.route({
      method: 'POST',
      url: '/projects/:project/files',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.saveFile,
    });
    fastify.route({
      method: 'POST',
      url: '/projects/:project/subjects/:subject/files',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.saveFile,
    });
    fastify.route({
      method: 'POST',
      url: '/projects/:project/subjects/:subject/studies/:study/files',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.saveFile,
    });
    fastify.route({
      method: 'POST',
      url: '/projects/:project/subjects/:subject/studies/:study/series/:series/files',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            series: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.saveFile,
    });
  
    fastify.route({
      method: 'POST',
      url: '/projects',
      schema: {
        tags: ['project'],
      },
      handler: fastify.createProject,
    });
  
    fastify.route({
      method: 'PUT',
      url: '/projects/:project',
      schema: {
        tags: ['project'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.updateProject,
    });
  
    fastify.route({
      method: 'DELETE',
      url: '/projects/:project',
      schema: {
        tags: ['project'],
        params: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.deleteProject,
    });
  
    // GET {s}/templates
    fastify.route({
      method: 'GET',
      url: '/projects',
      schema: {
        tags: ['project'],
        //   response: {
        //     200: 'templates_schema#',
        //   },
      },
      handler: fastify.getProjects,
    });
  
    fastify.route({
      method: 'GET',
      url: '/projects/:project',
      schema: {
        tags: ['project'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProject,
    });
  
    fastify.route({
      method: 'GET',
      url: '/projects/:project/files',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFiles,
    });
  
    fastify.route({
      method: 'GET',
      url: '/projects/:project/users',
      schema: {
        tags: ['project', 'users'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectUsers,
    });
  
    fastify.route({
      method: 'GET',
      url: '/projects/:project/subjects/:subject/files',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFiles,
    });
    fastify.route({
      method: 'GET',
      url: '/projects/:project/subjects/:subject/studies/:study/files',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFiles,
    });
    fastify.route({
      method: 'GET',
      url: '/projects/:project/subjects/:subject/studies/:study/series/:series/files',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            series: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFiles,
    });
  
    fastify.route({
      method: 'DELETE',
      url: '/projects/:project/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.deleteFileFromProject,
    });
    fastify.route({
      method: 'DELETE',
      url: '/projects/:project/subjects/:subject/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.deleteFileFromProject,
    });
    fastify.route({
      method: 'DELETE',
      url: '/projects/:project/subjects/:subject/studies/:study/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.deleteFileFromProject,
    });
    fastify.route({
      method: 'DELETE',
      url: '/projects/:project/subjects/:subject/studies/:study/series/:series/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            series: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.deleteFileFromProject,
    });
  
    fastify.route({
      method: 'GET',
      url: '/projects/:project/files/:filename',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFile,
    });
    fastify.route({
      method: 'GET',
      url: '/projects/:project/subjects/:subject/files/:filename',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFile,
    });
    fastify.route({
      method: 'GET',
      url: '/projects/:project/subjects/:subject/studies/:study/files/:filename',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFile,
    });
    fastify.route({
      method: 'GET',
      url: '/projects/:project/subjects/:subject/studies/:study/series/:series/files/:filename',
      schema: {
        tags: ['project', 'files'],
        querystring: {
          format: { type: 'string' },
        },
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            series: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.getProjectFile,
    });
  
    fastify.route({
      method: 'PUT',
      url: '/projects/:project/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.putOtherFileToProject,
    });
    fastify.route({
      method: 'PUT',
      url: '/projects/:project/subjects/:subject/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.putOtherFileToProject,
    });
    fastify.route({
      method: 'PUT',
      url: '/projects/:project/subjects/:subject/studies/:study/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.putOtherFileToProject,
    });
    fastify.route({
      method: 'PUT',
      url: '/projects/:project/subjects/:subject/studies/:study/series/:series/files/:filename',
      schema: {
        tags: ['project', 'files'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            study: {
              type: 'string',
            },
            series: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.putOtherFileToProject,
    });
  
    fastify.route({
      method: 'PUT',
      url: '/projects/:project/users/:user',
      schema: {
        tags: ['project', 'users'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            user: {
              type: 'string',
            },
          },
        },
        body: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.updateProjectUserRole,
    });
  
    fastify.route({
      method: 'DELETE',
      url: '/projects/:project/users/:user',
      schema: {
        tags: ['project', 'users'],
        params: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
            },
            user: {
              type: 'string',
            },
          },
        },
      },
      handler: fastify.deleteProjectUser,
    });
    */
}
module.exports = routes;
