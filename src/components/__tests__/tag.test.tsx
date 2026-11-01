import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { FiledByBadge } from '@/components/feed/filed-by-badge';
import { StatusPill } from '@/components/feed/status-pill';
import { TAG_HEIGHT } from '@/components/tag';
import { players } from '@/test-utils/entry-fixture';

describe('receipt tags', () => {
  it('prints the status and who logged it at the same height, so they line up', async () => {
    await render(
      <View>
        <StatusPill status="pending" />
        <FiledByBadge filer={players.dev} isSelfClaim={false} />
        <FiledByBadge filer={players.dev} isSelfClaim />
      </View>,
    );

    for (const tag of [
      screen.getByLabelText('Pending'),
      screen.getByLabelText('Logged by Dev'),
      screen.getByLabelText('Self-claim'),
    ]) {
      expect(tag).toHaveStyle({ height: TAG_HEIGHT });
    }
  });
});
