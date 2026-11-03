import { STATUS } from '../src/constants/status.js';

export const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/** A believable audit trail that ends at the given status. */
export const buildStatusHistory = (status, userId, officerId, submittedAt) => {
  const history = [{ from: 'NEW', to: STATUS.DRAFT, changedBy: userId, at: daysAgo(40), remarks: 'Application started' }];
  if (status === STATUS.DRAFT) return history;

  history.push({ from: STATUS.DRAFT, to: STATUS.SUBMITTED, changedBy: userId, at: submittedAt, remarks: 'Submitted by applicant' });
  if (status === STATUS.SUBMITTED) return history;

  if (status === STATUS.WITHDRAWN) {
    history.push({ from: STATUS.SUBMITTED, to: STATUS.WITHDRAWN, changedBy: userId, at: daysAgo(5), remarks: 'Joined another college' });
    return history;
  }

  history.push({ from: STATUS.SUBMITTED, to: STATUS.UNDER_REVIEW, changedBy: officerId, at: daysAgo(12), remarks: 'Picked up for verification' });
  if (status === STATUS.UNDER_REVIEW) return history;

  if (status === STATUS.ACTION_REQUIRED) {
    history.push({
      from: STATUS.UNDER_REVIEW,
      to: STATUS.ACTION_REQUIRED,
      changedBy: officerId,
      at: daysAgo(8),
      remarks: 'Community certificate is illegible — please re-upload a clear scan.',
    });
    return history;
  }
  if (status === STATUS.REJECTED) {
    history.push({
      from: STATUS.UNDER_REVIEW,
      to: STATUS.REJECTED,
      changedBy: officerId,
      at: daysAgo(6),
      remarks: 'Does not meet the minimum eligibility percentage.',
    });
    return history;
  }

  history.push({ from: STATUS.UNDER_REVIEW, to: STATUS.VERIFIED, changedBy: officerId, at: daysAgo(4), remarks: 'All documents verified' });
  return history;
};

export default buildStatusHistory;
