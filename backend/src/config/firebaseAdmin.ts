import admin from 'firebase-admin';

type ServiceAccountLike = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const getServiceAccount = (): ServiceAccountLike | null => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  const parsed = JSON.parse(raw) as ServiceAccountLike;
  if (!parsed.private_key || !parsed.client_email || !parsed.project_id) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is invalid');
  }

  return {
    ...parsed,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  };
};

export const initFirebaseAdmin = (): admin.app.App => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();
  const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id;

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId,
    });
  }

  return admin.initializeApp({
    projectId,
  });
};

export { admin };
