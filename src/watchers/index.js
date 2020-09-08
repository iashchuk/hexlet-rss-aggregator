import onChange from 'on-change';
import renderForm from './form.js';
import renderFeeds from './feeds.js';
import renderLoadingInfo from './loading.js';


export default (state) => onChange(state, (path) => {
  const { feeds, form, loading } = state;

  switch (path) {
    case 'form':
      return renderForm(form);

    case 'loading':
      return renderLoadingInfo(loading);

    case 'feeds':
      return renderFeeds(feeds);

    default:
      throw new Error(`Unknown state path: '${path}'`);
  }
});