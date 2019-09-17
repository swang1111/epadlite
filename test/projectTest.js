const chai = require('chai');

const chaiHttp = require('chai-http');
const fs = require('fs');
const nock = require('nock');
const studiesResponse = require('./data/studiesResponse.json');
const seriesResponse = require('./data/seriesResponse.json');
const config = require('../config/index');

chai.use(chaiHttp);
const { expect } = chai;

let server;
before(async () => {
  process.env.host = '0.0.0.0';
  process.env.port = 5987;
  server = require('../server'); // eslint-disable-line
  await server.ready();
});
after(() => {
  server.close();
});
beforeEach(() => {
  nock(config.dicomWebConfig.baseUrl)
    .get('/studies')
    .reply(200, studiesResponse);
  nock(config.dicomWebConfig.baseUrl)
    .get('/studies/0023.2015.09.28.3/series')
    .reply(200, seriesResponse);
  nock(config.dicomWebConfig.baseUrl)
    .matchHeader('content-length', '133095')
    .matchHeader('content-type', val => val.includes('multipart/related; type=application/dicom;'))
    .post('/studies')
    .reply(200);
  nock(config.dicomWebConfig.baseUrl)
    .delete('/studies/0023.2015.09.28.3')
    .reply(200);
});

describe('Project Tests', () => {
  before(async () => {
    try {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/users')
        .send({
          username: 'admin',
          firstname: 'admin',
          lastname: 'admin',
          email: 'admin@gmail.com',
        });
    } catch (err) {
      console.log(err);
    }
  });
  after(async () => {
    try {
      await chai.request(`http://${process.env.host}:${process.env.port}`).delete('/users/admin');
    } catch (err) {
      console.log(err);
    }
  });

  it('projects should have no projects ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .get('/projects')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.eql(0);
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('project create should be successful ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .post('/projects')
      .send({
        projectId: 'test',
        projectName: 'test',
        projectDescription: 'testdesc',
        defaultTemplate: 'ROI',
        type: 'private',
        userName: 'admin',
      })
      .then(res => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('projects should have 1 project with loginnames admin', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .get('/projects')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.eql(1);
        expect(res.body[0].loginNames).to.include('admin');
        done();
      })
      .catch(e => {
        done(e);
      });
  });

  it('project update should be successful ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .put('/projects/test?projectName=test1')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('projectname should be updated ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .get('/projects')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.pop().name).to.be.eql('test1');
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('project update with multiple fields should be successful ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .put('/projects/test?projectName=testupdated&description=testupdated&type=Public')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('multiple project fields should be updated ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .get('/projects')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        const lastEntry = res.body.pop();
        expect(lastEntry.name).to.be.eql('testupdated');
        expect(lastEntry.description).to.be.eql('testupdated');
        expect(lastEntry.type).to.be.eql('Public');
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('project endpoint should return the updated project ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .get('/projects/test')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        const lastEntry = res.body;
        expect(lastEntry.name).to.be.eql('testupdated');
        expect(lastEntry.description).to.be.eql('testupdated');
        expect(lastEntry.type).to.be.eql('Public');
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('project delete should be successful ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .delete('/projects/test')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  it('projects should have no projects ', done => {
    chai
      .request(`http://${process.env.host}:${process.env.port}`)
      .get('/projects')
      .then(res => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.eql(0);
        done();
      })
      .catch(e => {
        done(e);
      });
  });

  describe('Project Template Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testtemplate',
          projectName: 'testtemplate',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testtemplate2',
          projectName: 'testtemplate2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testtemplate');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testtemplate2');
    });

    it('project testtemplate should have no template ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project template save should be successful ', done => {
      const jsonBuffer = JSON.parse(fs.readFileSync('test/data/roiOnlyTemplate.json'));
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testtemplate/templates')
        .send(jsonBuffer)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate should have 1 template ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate should have ROI Only', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body[0].TemplateContainer.Template[0].codeMeaning).to.be.eql('ROI Only');
          expect(res.body[0].TemplateContainer.Template[0].codeValue).to.be.eql('ROI');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate should have template with uid 2.25.121060836007636801627558943005335', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body[0].TemplateContainer.uid).to.be.eql(
            '2.25.121060836007636801627558943005335'
          );
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project template put to project testtemplate2 as disabled should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put(
          '/projects/testtemplate2/templates/2.25.121060836007636801627558943005335?enable=false'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate2 should have ROI Only', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate2/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body[0].TemplateContainer.Template[0].codeMeaning).to.be.eql('ROI Only');
          expect(res.body[0].TemplateContainer.Template[0].codeValue).to.be.eql('ROI');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate2 should have ROI Only as disabled', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate2/templates?format=summary')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result[0].enabled).to.be.eql(false);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project template put to project testtemplate2 as enabled should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testtemplate2/templates/2.25.121060836007636801627558943005335?enable=true')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate2 should have ROI Only as enabled', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate2/templates?format=summary')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result[0].enabled).to.be.eql(true);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project template delete from testtemplate should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testtemplate/templates/2.25.121060836007636801627558943005335')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate should have no template ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testtemplate2 should still have ROI Only', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testtemplate2/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body[0].TemplateContainer.Template[0].codeMeaning).to.be.eql('ROI Only');
          expect(res.body[0].TemplateContainer.Template[0].codeValue).to.be.eql('ROI');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('ROI template should still be in the db', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.eql(1);
          expect(res.body[0].TemplateContainer.Template[0].codeMeaning).to.be.eql('ROI Only');
          expect(res.body[0].TemplateContainer.Template[0].codeValue).to.be.eql('ROI');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('template delete with uid 2.25.121060836007636801627558943005335 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testtemplate2/templates/2.25.121060836007636801627558943005335')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('templates should be empty', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/templates')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });

  // subjects tests
  describe('Project Subject Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testsubject',
          projectName: 'testsubject',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testsubject2',
          projectName: 'testsubject2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testsubject3',
          projectName: 'testsubject3',
          projectDescription: 'test3desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testsubject');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testsubject2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testsubject3');
    });
    it('project testsubject should have no subjects ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project subject add of patient 3 to project testsubject should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testsubject/subjects/3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project subject add of patient 3 to project testsubject2 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testsubject2/subjects/3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project subject add of patient 3 to project testsubject3 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testsubject3/subjects/3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject should have 1 subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testsubject should have subject 3', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result[0].subjectID).to.be.eql('3');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testsubject should have study 0023.2015.09.28.3 of subject 3', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects/3/studies')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result[0].studyUID).to.be.eql('0023.2015.09.28.3');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('subject retrieval with project subject endpoint should return subject 3 from  project testsubject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects/3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.subjectID).to.be.eql('3');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('subject retrieval with project subject endpoint should get 404 for subject 7 from  project testsubject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects/7')
        .then(res => {
          expect(res.statusCode).to.equal(404);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project subject deletion of patient 3 from testsubject project should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testsubject/subjects/3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject should have no subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject2 should have 1 subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject2/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject3 should have 1 subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject3/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project subject deletion of patient 3 of system should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testsubject3/subjects/3?all=true')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject should have no subject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject2 should have no subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject2/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testsubject3 should have no subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testsubject3/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
  // study tests
  describe('Project Study Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'teststudy',
          projectName: 'teststudy',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'teststudy2',
          projectName: 'teststudy2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'teststudy3',
          projectName: 'teststudy3',
          projectDescription: 'test3desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/teststudy');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/teststudy2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/teststudy3');
    });
    it('project teststudy should have no subjects ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project study add of study 0023.2015.09.28.3 to project teststudy should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/teststudy/subjects/3/studies/0023.2015.09.28.3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project study add of study 0023.2015.09.28.3 to project teststudy2 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/teststudy2/subjects/3/studies/0023.2015.09.28.3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project study add of study 0023.2015.09.28.3 to project teststudy3 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/teststudy3/subjects/3/studies/0023.2015.09.28.3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy should have 1 subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project teststudy should have subject 3', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result[0].subjectID).to.be.eql('3');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project teststudy should have study 0023.2015.09.28.3 of subject 3', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects/3/studies')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result[0].studyUID).to.be.eql('0023.2015.09.28.3');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project study endpoint should return study entity for project teststudy, study 0023.2015.09.28.3 of subject 3', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects/3/studies/0023.2015.09.28.3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.studyUID).to.be.eql('0023.2015.09.28.3');
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project study endpoint should return 404 for made up study 56547547373', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects/3/studies/56547547373')
        .then(res => {
          expect(res.statusCode).to.equal(404);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project study deletion of patient 3 study 0023.2015.09.28.3 from teststudy project should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/teststudy/subjects/3/studies/0023.2015.09.28.3')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy should have no subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy2 should have 1 subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy2/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy3 should have 1 subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy3/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project study deletion of patient 3 study 0023.2015.09.28.3 of system should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/teststudy3/subjects/3/studies/0023.2015.09.28.3?all=true')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy should have no subject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy2 should have no subject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy2/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project teststudy3 should have no subject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/teststudy3/subjects')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ResultSet.Result.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
  describe('Project Aim Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testaim',
          projectName: 'testaim',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testaim2',
          projectName: 'testaim2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testaim3',
          projectName: 'testaim3',
          projectDescription: 'test3desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testaim');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testaim2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testaim3');
    });
    it('project testaim should have no aims ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim save to project testaim should be successful ', done => {
      const jsonBuffer = JSON.parse(fs.readFileSync('test/data/roi_sample_aim.json'));
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testaim/aims')
        .send(jsonBuffer)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testaim should have one aim', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for project testaim with uid 2.25.211702350959705565754863799143359605362 should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/aims/2.25.211702350959705565754863799143359605362')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project aim add of aim 2.25.211702350959705565754863799143359605362 to project testaim2 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testaim2/aims/2.25.211702350959705565754863799143359605362')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project aim add of aim 2.25.211702350959705565754863799143359605362 to project testaim3 should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testaim3/aims/2.25.211702350959705565754863799143359605362')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project aim endpoint should return aim for project testaim2, aim 2.25.211702350959705565754863799143359605362', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim2/aims/2.25.211702350959705565754863799143359605362')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.ImageAnnotationCollection.uniqueIdentifier.root).to.be.eql(
            '2.25.211702350959705565754863799143359605362'
          );
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project aim endpoint should return 404 for made up aimuid ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim2/aims/56547547373')
        .then(res => {
          expect(res.statusCode).to.equal(404);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for series 1.3.12.2.1107.5.8.2.484849.837749.68675556.2003110718442012313 of patient 13116 in project testaim should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testaim/subjects/13116/studies/1.3.12.2.1107.5.8.2.484849.837749.68675556.20031107184420110/series/1.3.12.2.1107.5.8.2.484849.837749.68675556.2003110718442012313/aims'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body[0].ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for study 1.3.12.2.1107.5.8.2.484849.837749.68675556.20031107184420110 of patient 13116 in project testaim should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testaim/subjects/13116/studies/1.3.12.2.1107.5.8.2.484849.837749.68675556.20031107184420110/aims'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body[0].ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for patient 13116 in project testaim should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/subjects/13116/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body[0].ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for series 1.3.12.2.1107.5.8.2.484849.837749.68675556.2003110718442012313 of patient 13116 with aimuid in project testaim should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testaim/subjects/13116/studies/1.3.12.2.1107.5.8.2.484849.837749.68675556.20031107184420110/series/1.3.12.2.1107.5.8.2.484849.837749.68675556.2003110718442012313/aims/2.25.211702350959705565754863799143359605362'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for study 1.3.12.2.1107.5.8.2.484849.837749.68675556.20031107184420110 of patient 13116 with aimuid in project testaim should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testaim/subjects/13116/studies/1.3.12.2.1107.5.8.2.484849.837749.68675556.20031107184420110/aims/2.25.211702350959705565754863799143359605362'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for patient 13116 with aimuid in project testaim should be Lesion1', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/subjects/13116/aims/2.25.211702350959705565754863799143359605362')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion1');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim update with changing the name to Lesion2 should be successful ', done => {
      const jsonBuffer = JSON.parse(fs.readFileSync('test/data/roi_sample_aim.json'));
      const nameSplit = jsonBuffer.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
        '~'
      );
      nameSplit[0] = 'Lesion2';
      jsonBuffer.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value = nameSplit.join(
        '~'
      );
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put(`/projects/testaim/aims/${jsonBuffer.ImageAnnotationCollection.uniqueIdentifier.root}`)
        .send(jsonBuffer)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('aim returned for project testaim should be Lesion2 now', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(
            res.body[0].ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name.value.split(
              '~'
            )[0]
          ).to.be.eql('Lesion2');
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project aim deletion of aim 2.25.211702350959705565754863799143359605362 from testaim project should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testaim/aims/2.25.211702350959705565754863799143359605362')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testaim should have no aim ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim/aims')
        .then(res => {
          // console.log('resr', res.body.length);
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testaim2 should have 1 aim ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim2/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testaim3 should have 1 aim ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim3/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project aim deletion of aim 2.25.211702350959705565754863799143359605362 of system should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testaim/aims/2.25.211702350959705565754863799143359605362?all=true')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it('project testaim2 should have no aim', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim2/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testaim3 should have no aim', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testaim3/aims')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
  describe('Project File Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfile',
          projectName: 'testfile',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfile2',
          projectName: 'testfile2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfile3',
          projectName: 'testfile3',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfile');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfile2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfile3');
    });
    it('project testfile should have no files ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('unknown extension file upload should fail ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfile/files')
        .attach('files', 'test/data/unknownextension.abc', 'test/data/unknownextension.abc')
        .then(res => {
          expect(res.statusCode).to.not.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testfile should still have no files ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('jpg file upload should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfile/files')
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testfile should have 1 file ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfile2 project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(`/projects/testfile2/files/${res.body[0].name}`)
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfile3 project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(`/projects/testfile3/files/${res.body[0].name}`)
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should get json with filename (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(`/projects/testfile/files/${res.body[0].name}`)
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet.body.name).to.equal(res.body[0].name);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should download file with filename (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(`/projects/testfile/files/${res.body[0].name}`)
            .query({ format: 'stream' })
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet).to.have.header(
                'Content-Disposition',
                'attachment; filename=files.zip'
              );
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('jpg file delete with filename retrieval and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(`/projects/testfile/files/${res.body[0].name}`)
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testfile should have no files ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testfile2 should have 1 file ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile2/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('jpg file delete from system with filename retrieval from testfile2 and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile2/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(`/projects/testfile2/files/${res.body[0].name}`)
            .query({ all: 'true' })
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testfile2 should have no files ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile2/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('project testfile3 should have no files ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfile3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
  describe('Project File Subject Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilesubject',
          projectName: 'testfilesubject',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilesubject2',
          projectName: 'testfilesubject2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilesubject3',
          projectName: 'testfilesubject3',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilesubject4',
          projectName: 'testfilesubject4',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfilesubject/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfilesubject2/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfilesubject3/subjects/3');
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject4');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject2/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilesubject3/subjects/3');
    });
    it('should return no files for subject 3 in project testfilesubject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail uploading unknown extension file to subject 3 in project testfilesubject', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfilesubject/subjects/3/files')
        .attach('files', 'test/data/unknownextension.abc', 'test/data/unknownextension.abc')
        .then(res => {
          expect(res.statusCode).to.not.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should still return no files for subject 3 in project testfilesubject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail uploading jpg file to subject 7 nonexistent in project testfilesubject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfilesubject/subjects/7/files')
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(503);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed uploading jpg file to subject 3 in project testfilesubject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfilesubject/subjects/3/files')
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return 1 file for subject 3 in project testfilesubject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfilesubject2 project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(`/projects/testfilesubject2/subjects/3/files/${res.body[0].name}`)
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfilesubject3 project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(`/projects/testfilesubject3/subjects/3/files/${res.body[0].name}`)
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail adding add file to testfilesubject4 project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(`/projects/testfilesubject4/subjects/3/files/${res.body[0].name}`)
            .then(resPut => {
              expect(resPut.statusCode).to.equal(503);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should get json with filename (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(`/projects/testfilesubject/subjects/3/files/${res.body[0].name}`)
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet.body.name).to.equal(res.body[0].name);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should download file with filename (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(`/projects/testfilesubject/subjects/3/files/${res.body[0].name}`)
            .query({ format: 'stream' })
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet).to.have.header(
                'Content-Disposition',
                'attachment; filename=files.zip'
              );
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed in deleting jpg file from project testfilesubject with filename retrieval and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(`/projects/testfilesubject/subjects/3/files/${res.body[0].name}`)
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3 in project testfilesubject ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return 1 file for subject 3 in project testfilesubject2 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject2/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed in deleting jpg file from system with filename retrieval from testfilesubject2 and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject2/subjects/3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(`/projects/testfilesubject2/subjects/3/files/${res.body[0].name}`)
            .query({ all: 'true' })
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3 in project testfilesubject2 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject2/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3 in project testfilesubject3 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilesubject3/subjects/3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
  describe('Project File Study Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilestudy',
          projectName: 'testfilestudy',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilestudy2',
          projectName: 'testfilestudy2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilestudy3',
          projectName: 'testfilestudy3',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfilestudy4',
          projectName: 'testfilestudy4',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfilestudy/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfilestudy2/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfilestudy3/subjects/3');
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy4');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy2/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfilestudy3/subjects/3');
    });
    it('should return no files for subject 3, study 0023.2015.09.28.3 in project testfilestudy', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail uploading unknown extension file to subject 3, study 0023.2015.09.28.3 in project testfilestudy', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .attach('files', 'test/data/unknownextension.abc', 'test/data/unknownextension.abc')
        .then(res => {
          expect(res.statusCode).to.not.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should still return no files for subject 3, study 0023.2015.09.28.3  in project testfilestudy ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail uploading jpg file to subject 7, study 64363473737.86569494 nonexistent in project testfilestudy ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfilestudy/subjects/7/studies/64363473737.86569494/files')
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(503);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed uploading jpg file to subject 3, study 0023.2015.09.28.3  in project testfilestudy ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return 1 file for subject 3, study 0023.2015.09.28.3  in project testfilestudy ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfilestudy2 project, study 0023.2015.09.28.3  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(
              `/projects/testfilestudy2/subjects/3/studies/0023.2015.09.28.3/files/${
                res.body[0].name
              }`
            )
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfilestudy3 project, study 0023.2015.09.28.3  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(
              `/projects/testfilestudy3/subjects/3/studies/0023.2015.09.28.3/files/${
                res.body[0].name
              }`
            )
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail adding add file to testfilestudy4, study 0023.2015.09.28.3  project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(
              `/projects/testfilestudy4/subjects/3/studies/0023.2015.09.28.3/files/${
                res.body[0].name
              }`
            )
            .then(resPut => {
              expect(resPut.statusCode).to.equal(503);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should get json with filename, study 0023.2015.09.28.3  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(
              `/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files/${
                res.body[0].name
              }`
            )
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet.body.name).to.equal(res.body[0].name);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should download file with filename, study 0023.2015.09.28.3  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(
              `/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files/${
                res.body[0].name
              }`
            )
            .query({ format: 'stream' })
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet).to.have.header(
                'Content-Disposition',
                'attachment; filename=files.zip'
              );
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed in deleting jpg file from project testfilestudy, study 0023.2015.09.28.3  with filename retrieval and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(
              `/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files/${
                res.body[0].name
              }`
            )
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3, study 0023.2015.09.28.3  in project testfilestudy ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return 1 file for subject 3, study 0023.2015.09.28.3  in project testfilestudy2 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy2/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed in deleting jpg file of study 0023.2015.09.28.3 from system with filename retrieval from testfilestudy2 and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy2/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(`/projects/testfilestudy2/subjects/3/files/${res.body[0].name}`)
            .query({ all: 'true' })
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3, study 0023.2015.09.28.3  in project testfilestudy2 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy2/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3, study 0023.2015.09.28.3  in project testfilestudy3 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get('/projects/testfilestudy3/subjects/3/studies/0023.2015.09.28.3/files')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
  describe('Project File Series Tests', () => {
    before(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfileseries',
          projectName: 'testfileseries',
          projectDescription: 'testdesc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfileseries2',
          projectName: 'testfileseries2',
          projectDescription: 'test2desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfileseries3',
          projectName: 'testfileseries3',
          projectDescription: 'test3desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects')
        .send({
          projectId: 'testfileseries4',
          projectName: 'testfileseries4',
          projectDescription: 'test4desc',
          defaultTemplate: 'ROI',
          type: 'private',
          userName: 'admin',
        });
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfileseries/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfileseries2/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .put('/projects/testfileseries3/subjects/3');
    });
    after(async () => {
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries2');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries4');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries2/subjects/3');
      await chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .delete('/projects/testfileseries3/subjects/3');
    });
    it('should return no files for subject 3, series 0023.2015.09.28.3.3590 in project testfileseries', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail uploading unknown extension file to subject 3, series 0023.2015.09.28.3.3590 in project testfileseries', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .attach('files', 'test/data/unknownextension.abc', 'test/data/unknownextension.abc')
        .then(res => {
          expect(res.statusCode).to.not.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should still return no files for subject 3, series 0023.2015.09.28.3.3590  in project testfileseries ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail uploading jpg file to subject 7, study 64363473737.86569494 nonexistent in project testfileseries ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post('/projects/testfileseries/subjects/7/studies/64363473737.86569494/files')
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(503);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed uploading jpg file to subject 3, series 0023.2015.09.28.3.3590  in project testfileseries ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .post(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .attach('files', 'test/data/08240122.JPG', '08240122.JPG')
        .then(res => {
          expect(res.statusCode).to.equal(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return 1 file for subject 3, series 0023.2015.09.28.3.3590  in project testfileseries ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfileseries2 project, series 0023.2015.09.28.3.3590  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(
              `/projects/testfileseries2/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files/${
                res.body[0].name
              }`
            )
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should add file to testfileseries3 project, series 0023.2015.09.28.3.3590  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(
              `/projects/testfileseries3/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files/${
                res.body[0].name
              }`
            )
            .then(resPut => {
              expect(resPut.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should fail adding add file to testfileseries4, series 0023.2015.09.28.3.3590  project (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .put(
              `/projects/testfileseries4/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files/${
                res.body[0].name
              }`
            )
            .then(resPut => {
              expect(resPut.statusCode).to.equal(503);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should get json with filename, series 0023.2015.09.28.3.3590  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(
              `/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files/${
                res.body[0].name
              }`
            )
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet.body.name).to.equal(res.body[0].name);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should download file with filename, series 0023.2015.09.28.3.3590  (filename retrieval is done via get all) ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .get(
              `/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files/${
                res.body[0].name
              }`
            )
            .query({ format: 'stream' })
            .then(resGet => {
              expect(resGet.statusCode).to.equal(200);
              expect(resGet).to.have.header(
                'Content-Disposition',
                'attachment; filename=files.zip'
              );
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed in deleting jpg file from project testfileseries, series 0023.2015.09.28.3.3590  with filename retrieval and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(
              `/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files/${
                res.body[0].name
              }`
            )
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3, series 0023.2015.09.28.3.3590  in project testfileseries ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return 1 file for subject 3, series 0023.2015.09.28.3.3590  in project testfileseries2 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries2/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(1);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should succeed in deleting jpg file of series 0023.2015.09.28.3.3590 from system with filename retrieval from testfileseries2 and delete should be successful ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries2/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          chai
            .request(`http://${process.env.host}:${process.env.port}`)
            .delete(`/projects/testfileseries2/subjects/3/files/${res.body[0].name}`)
            .query({ all: 'true' })
            .then(resDel => {
              expect(resDel.statusCode).to.equal(200);
              done();
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3, series 0023.2015.09.28.3.3590  in project testfileseries2 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries2/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
    it('should return no files for subject 3, series 0023.2015.09.28.3.3590  in project testfileseries3 ', done => {
      chai
        .request(`http://${process.env.host}:${process.env.port}`)
        .get(
          '/projects/testfileseries3/subjects/3/studies/0023.2015.09.28.3/series/0023.2015.09.28.3.3590/files'
        )
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.length).to.be.eql(0);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
});
