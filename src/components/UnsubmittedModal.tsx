/* eslint-disable react-hooks/exhaustive-deps */
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { HighScoreType } from '../types/types';
import { createValidUsername } from '../utils/createValidUsername';
import { createLeaderboard } from '../utils/firebase-operations/createLeaderboard';
import { MenuModal } from './MenuModal';
import { SettingsButton } from './Settings/SettingsButton';

interface UnsubmittedModalProps {
  //   onClose?: () => any;
  //   isOpen: boolean;
  toUpdate: Partial<HighScoreType>;
  displayName: string;
}

export const UnsubmittedModal: React.FC<UnsubmittedModalProps> = ({
  //   isOpen,
  //   onClose,
  toUpdate,
  displayName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  //   On call open
  useEffect(() => {
    onOpen();
  }, []);

  return (
    <MenuModal
      isOpen={isOpen}
      onClose={onClose}
      headerText='Unsubmitted Highscore'
      size={'lg'}
    >
      <form>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            type='text'
            ref={inputRef}
            autoComplete='off'
            textTransform='lowercase'
            isRequired
            placeholder={`Default: ${createValidUsername(displayName)}`}
          />
          <FormHelperText>
            You've got unsubmitted score for some of the categories
          </FormHelperText>
        </FormControl>
        <SettingsButton
          w='100%'
          mx='auto'
          display='block'
          mt={8}
          type='submit'
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            await createLeaderboard(displayName, {
              game: toUpdate,
              name: inputRef.current?.value || createValidUsername(displayName),
            });
            setLoading(false);
            onClose();
          }}
          isLoading={loading}
          loadingText='Submitting...'
        >
          Submit
        </SettingsButton>
      </form>
    </MenuModal>
  );
};
