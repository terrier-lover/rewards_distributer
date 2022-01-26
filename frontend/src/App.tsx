import { Center } from '@chakra-ui/react'
import Header from './Header';
import FundDistributionCardWeb3Container from './FundDistributionCardWeb3Container';
import { TOKEN_NAME, TOKEN_IMAGE_URL } from './DefaultSettings';
import CommonErrorBoundary from './CommonErrorBoundary';
import ThirdwebProviderWrapper from './ThirdwebProviderWrapper';

function App() {
  return (
    <ThirdwebProviderWrapper>
      <CommonErrorBoundary>
        <Header
          tokenName={TOKEN_NAME}
          tokenImageURL={TOKEN_IMAGE_URL}
        />
      </CommonErrorBoundary>
      <Center marginTop={{
        base: '20px',
        sm: '30px',
        md: '40px',
        lg: '50px',
        xl: '50px'
      }} bg='white' color='white'>
        <CommonErrorBoundary>
          <FundDistributionCardWeb3Container />
        </CommonErrorBoundary>
      </Center>
    </ThirdwebProviderWrapper>
  );
}

export default App;
