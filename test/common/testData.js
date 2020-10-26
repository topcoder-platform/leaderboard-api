/*
 * Test Data
 */

const submissionAPIResponse = [
  {
    'updatedBy': 'lazybaer',
    'created': '2018-08-22T02:41:07.576Z',
    'isFileSubmission': true,
    'type': 'challengesubmission',
    'url': 'https://topcoder-dev-submissions-dmz.s3.amazonaws.com/a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
    'challengeId': 30051825,
    'filename': 'CORE-TopcoderEventBus-190618-1413.pdf.zip',
    'createdBy': 'lazybaer',
    'id': 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
    'submissionPhaseId': 747596,
    'updated': '2018-08-22T02:41:07.576Z',
    'fileType': 'zip',
    'memberId': 8547899
  },
  {
    'updatedBy': 'lazybaer',
    'created': '2018-08-22T02:41:07.576Z',
    'isFileSubmission': true,
    'type': 'challengesubmission',
    'url': 'https://topcoder-dev-submissions-dmz.s3.amazonaws.com/a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
    'challengeId': 30051825,
    'filename': 'CORE-TopcoderEventBus-190618-1413.pdf.zip',
    'createdBy': 'lazybaer',
    'id': 'a34e1158-2c27-4d38-b079-5e5cca1bdcf8',
    'submissionPhaseId': 747596,
    'updated': '2018-08-22T02:41:07.576Z',
    'fileType': 'zip',
    'memberId': 22688726
  }
]

const challengeAPIResponse = [
  {
    'id': '2587d0de:16de737ff0d:3225',
    'result': {
      'success': true,
      'status': 200,
      'metadata': null,
      'content': []
    },
    'version': 'v3'
  },
  {
    'id': '-3254eca5:16658dbed10:2c2a',
    'result': {
      'success': true,
      'status': 200,
      'metadata': {
        'fields': null,
        'totalCount': 1
      },
      'content': [
        {
          'groupIds': [
            20000000
          ]
        }
      ]
    }
  },
  {
    'id': '-3254eca5:16658dbed10:2c2a',
    'result': {
      'success': true,
      'status': 200,
      'metadata': {
        'fields': null,
        'totalCount': 1
      },
      'content': [
        {
          'groupIds': [
            202343,
            20000000
          ]
        }
      ]
    }
  },
  {
    'id': '-3254eca5:16658dbed10:2c2a',
    'result': {
      'success': true,
      'status': 200,
      'metadata': {
        'fields': null,
        'totalCount': 1
      },
      'content': [
        {
          'groupIds': [
            30000
          ]
        }
      ]
    }
  }
]

const memberAPIResponse = [
  {
    'id': '2587d0de:16de737ff0d:3225',
    'result': {
      'success': true,
      'status': 200,
      'metadata': null,
      'content': []
    },
    'version': 'v3'
  },
  {
    'id': '311d312:166718c336c:1936',
    'result': {
      'success': true,
      'status': 200,
      'metadata': null,
      'content': [
        {
          'id': '8547899',
          'modifiedBy': null,
          'modifiedAt': '2018-10-14T02:53:38.000Z',
          'createdBy': null,
          'createdAt': '2004-03-21T21:05:32.000Z',
          'handle': 'TonyJ',
          'email': 'tjefts+dev@topcoder.com',
          'firstName': 'Tony',
          'lastName': 'L_NAME',
          'credential': {
            'activationCode': 'UASI7X0JS',
            'resetToken': null,
            'hasPassword': true
          },
          'status': 'A',
          'country': null,
          'regSource': null,
          'utmSource': null,
          'utmMedium': null,
          'utmCampaign': null,
          'roles': null,
          'ssoLogin': false,
          'active': true,
          'profile': null,
          'emailActive': true
        }
      ]
    },
    'version': 'v3'
  },
  {
    'id': '2587d0de:16de737ff0d:3203',
    'result': {
      'success': true,
      'status': 200,
      'metadata': null,
      'content': [
        {
          'id': '22688726',
          'modifiedBy': null,
          'modifiedAt': '2019-10-16T03:39:37.000Z',
          'createdBy': null,
          'createdAt': '2007-07-05T05:25:12.000Z',
          'handle': 'vasyl',
          'email': 'email@domain.com.z',
          'firstName': 'F_NAME',
          'lastName': 'L_NAME',
          'credential': {
            'activationCode': 'MC8XPOC3Z7',
            'resetToken': null,
            'hasPassword': true
          },
          'status': 'A',
          'country': null,
          'regSource': null,
          'utmSource': null,
          'utmMedium': null,
          'utmCampaign': null,
          'roles': null,
          'ssoLogin': false,
          'profile': null,
          'active': true,
          'emailActive': true
        }
      ]
    },
    'version': 'v3'
  }
]

const M2M_FULL_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoiOFFvdkRoMjdTckR1MVhTczY4bTIxQTFOQlA4aXN2T3RAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNjAzMjE4NjM1LCJleHAiOjIxNDc0ODM2NDgsImF6cCI6IjhRb3ZEaDI3U3JEdTFYU3M2OG0yMUExTkJQOGlzdk90Iiwic2NvcGUiOiJyZWFkOmNoYWxsZW5nZXMgcmVhZDpncm91cHMgcmVhZDpzdWJtaXNzaW9uIHJlYWQ6cmV2aWV3X3R5cGUgdXBkYXRlOnJldmlld19zdW1tYXRpb24gcmVhZDpyZXZpZXdfc3VtbWF0aW9uIGNyZWF0ZTpyZXZpZXdfc3VtbWF0aW9uIHVwZGF0ZTpyZXZpZXcgcmVhZDpyZXZpZXcgZGVsZXRlOnJldmlldyBjcmVhdGU6cmV2aWV3IGFsbDpyZXZpZXcgcmVhZDpwcm9qZWN0IHdyaXRlOmJ1c19hcGkgcmVhZDp1c2VyX3Byb2ZpbGVzIHJlYWQ6cm9sZXMgY3JlYXRlOmxlYWRlcmJvYXJkIHVwZGF0ZTpsZWFkZXJib2FyZCBkZWxldGU6bGVhZGVyYm9hcmQgYWxsOmxlYWRlcmJvYXJkIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.wAv4YZhNXbPai9zKUfVFBhQ3vq6Itir8265WgybeBVk'

module.exports = {
  submissionAPIResponse,
  challengeAPIResponse,
  memberAPIResponse,
  M2M_FULL_TOKEN
}
