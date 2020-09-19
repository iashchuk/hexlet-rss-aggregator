/* eslint-disable no-param-reassign */

import axios from 'axios';
import _ from 'lodash';
import { parseRss } from './parseRss';
import constants from './constants';

const loadFeed = (state, url) => {
  state.loading = {
    ...state.loading,
    status: 'loading',
  };

  axios.get(`${constants.proxy}/${url}`)
    .then((response) => {
      const { title, items } = parseRss(response.data);
      const id = _.uniqueId();
      const timestamp = _.now();
      const posts = items.map((item) => ({ ...item, feedId: id, timestamp }));

      state.feeds = [
        ...state.feeds,
        {
          id, title, url, timestamp,
        },
      ];

      state.posts = [...state.posts, ...posts];

      state.loading = {
        ...state.loading,
        status: 'waiting',
      };
    })
    .catch((error) => {
      state.loading = {
        status: 'failed',
        error: error.message,
      };
      throw error;
    });
};

const watchFeed = (state) => {
  const promises = state.feeds.map(({ id, url }) => axios.get(`${constants.proxy}/${url}`)
    .then((response) => {
      const { items } = parseRss(response.data);
      const timestamp = _.now();
      const update = items.map((item) => ({ ...item, feedId: id, timestamp }));
      return _.differenceWith(update, state.posts, (post1, post2) => post1.link === post2.link);
    })
    .catch((error) => {
      state.loading = {
        status: 'failed',
        error: error.message,
      };
      throw error;
    }));

  Promise.all(promises)
    .then((data) => {
      state.posts = data.reduce((posts, update) => [...posts, ...update], state.posts);
    }).finally(() => {
      setTimeout(() => watchFeed(state), constants.updateInterval);
    });
};

export default {
  watchFeed,
  loadFeed,
};
