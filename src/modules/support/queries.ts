import * as ReactQuery from '@tanstack/react-query';

import { sendIdeaApi } from './api/sendIdeaApi';
import { alertActionFailed } from '@/shared/ui/alertActionFailed';

export function useSendIdea() {
  return ReactQuery.useMutation({
    mutationFn: sendIdeaApi,
    onError: () => alertActionFailed('отправить предложение'),
  });
}
